import { parseFromFile } from '@collectionscms/plugin-wp-importer';
import { Knex } from 'knex';
import { UnsupportedMediaTypeException } from '../../exceptions/unsupportedMediaType.js';
import { getDatabase } from '../database/connection.js';
import { SchemaOverview, getSchemaOverview } from '../database/overview.js';
import { PrimaryKey } from '../database/schemas.js';
import { AbstractServiceOptions } from './base.js';
import { ContentsService } from './contents.js';
import { FieldsService } from './fields.js';
import { ModelsService } from './models.js';

export class ImportDataService {
  database: Knex;
  schema: SchemaOverview;

  constructor(options: AbstractServiceOptions) {
    this.schema = options.schema;
    this.database = options.database || getDatabase();
  }

  /**
   * @description Import data from buffer
   * @param mimetype
   * @param buffer
   * @returns
   */
  async importData(mimetype: string, buffer: Buffer): Promise<void> {
    switch (mimetype) {
      case 'text/xml':
        return await this.importXml(buffer);
      default:
        throw new UnsupportedMediaTypeException();
    }
  }

  private async importXml(buffer: Buffer): Promise<void> {
    const service = new ModelsService({ database: this.database, schema: this.schema });
    const models = await service.readMany({
      filter: {
        _and: [
          { model: { _in: ['posts', 'categories', 'tags'] } },
          { source: { _eq: 'wordpress' } },
        ],
      },
    });

    const modelIds = models.reduce(
      (acc, model) => {
        acc[model.model] = model.id;
        return acc;
      },
      {} as Record<string, number>
    );

    // /////////////////////////////////////
    // Create fixed data
    // /////////////////////////////////////

    const modelKeys = await this.createModels(modelIds);
    await this.createFields(modelKeys, modelIds);

    // /////////////////////////////////////
    // Create contents from file
    // /////////////////////////////////////

    await service.database.transaction(async (tx) => {
      const result = await parseFromFile(buffer.toString());
      const schema = await getSchemaOverview({ database: tx });
      await this.createContents('categories', tx, schema, result.categories);
      await this.createContents('tags', tx, schema, result.tags);
      await this.createContents('posts', tx, schema, result.posts);
    });
  }

  private async createModels(
    registeredModelIds: Record<string, number>
  ): Promise<Record<string, PrimaryKey>> {
    const models = [
      { model: 'categories', hasStatus: false },
      { model: 'tags', hasStatus: false },
      { model: 'posts', hasStatus: true },
    ];

    const result: Record<string, PrimaryKey> = {};

    for (const { model, hasStatus } of models) {
      if (registeredModelIds[model]) {
        result[model] = registeredModelIds[model];
      } else {
        const modelsService = new ModelsService({ database: this.database, schema: this.schema });
        const modelId = await modelsService.createModel(
          {
            model: model,
            singleton: false,
            hidden: false,
            status_field: null,
            draft_value: null,
            publish_value: null,
            archive_value: null,
            source: 'wordpress',
          },
          hasStatus
        );

        result[model] = modelId;
      }
    }

    return result;
  }

  private async createFields(
    modelKeys: Record<string, PrimaryKey>,
    registeredModels: Record<string, number>
  ): Promise<void> {
    const fieldsService = new FieldsService({ database: this.database, schema: this.schema });

    // /////////////////////////////////////
    // Categories
    // /////////////////////////////////////

    if (!registeredModels['categories']) {
      // field
      await this.createFieldsForModel(fieldsService, 'categories', modelKeys, [
        { field: 'name', label: 'Name', interface: 'input' },
        { field: 'slug', label: 'Slug', interface: 'input' },
      ]);

      // relational fields
      await this.createRelationalFieldsForModel(fieldsService, 'categories', modelKeys);
    }

    // /////////////////////////////////////
    // Tags
    // /////////////////////////////////////

    if (!registeredModels['tags']) {
      // fields
      await this.createFieldsForModel(fieldsService, 'tags', modelKeys, [
        { field: 'name', label: 'Name', interface: 'input' },
        { field: 'slug', label: 'Slug', interface: 'input' },
      ]);

      // relational fields
      await this.createRelationalFieldsForModel(fieldsService, 'tags', modelKeys);
    }

    // /////////////////////////////////////
    // Posts
    // /////////////////////////////////////

    if (!registeredModels['posts']) {
      // fields
      await this.createFieldsForModel(fieldsService, 'posts', modelKeys, [
        { field: 'title', label: 'Title', interface: 'input' },
        { field: 'content', label: 'Content', interface: 'inputRichTextMd' },
        { field: 'slug', label: 'Slug', interface: 'input' },
        { field: 'published_date', label: 'publishedDate', interface: 'dateTime' },
        { field: 'is_page', label: 'isPage', interface: 'boolean' },
      ]);
    }
  }

  private async createFieldsForModel(
    service: FieldsService,
    model: string,
    modelKeys: Record<string, PrimaryKey>,
    fields: { field: string; label: string; interface: string }[]
  ) {
    let sort = 0;
    for (const field of fields) {
      const newField = {
        model,
        model_id: modelKeys[model],
        ...field,
        readonly: false,
        required: false,
        hidden: false,
        special: null,
        options: null,
        sort: sort,
      };

      await service.createField(newField);
      sort++;
    }
  }

  private async createRelationalFieldsForModel(
    service: FieldsService,
    manyModel: string,
    modelKeys: Record<string, PrimaryKey>
  ) {
    await service.createRelationalFields(
      {
        many_model: manyModel,
        many_model_id: modelKeys[manyModel],
        many_field: 'post_id',
        one_model: 'posts',
        one_model_id: modelKeys['posts'],
        one_field: manyModel,
      },
      [
        {
          model: 'posts',
          model_id: modelKeys['posts'],
          field: manyModel,
          label: manyModel,
          interface: 'listOneToMany',
          readonly: false,
          required: false,
          hidden: false,
          special: null,
          options: null,
          sort: 10,
        },
        {
          model: manyModel,
          model_id: modelKeys[manyModel],
          field: 'post_id',
          label: 'Post Id',
          interface: 'selectDropdownManyToOne',
          readonly: false,
          required: false,
          hidden: true,
          special: null,
          options: null,
          sort: 11,
        },
      ]
    );
  }

  private async createContents(
    model: string,
    tx: Knex.Transaction,
    schema: SchemaOverview,
    items: Record<string, any>[]
  ): Promise<void> {
    const filesOverview = schema.models[model].fields;
    const service = new ContentsService(model, { database: tx, schema: schema });
    for (const item of items) {
      delete item.id;
      item.id = await service.createContent(item, Object.values(filesOverview));
    }
  }
}
