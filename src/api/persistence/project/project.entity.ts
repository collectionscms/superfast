import { Project } from '@prisma/client';
import { v4 } from 'uuid';
import { getLanguageCodeType, LanguageCode } from '../../../constants/languages.js';
import { env } from '../../../env.js';
import { UnexpectedException } from '../../../exceptions/unexpected.js';
import { PrismaBaseEntity } from '../prismaBaseEntity.js';

export class ProjectEntity extends PrismaBaseEntity<Project> {
  static Construct({
    name,
    sourceLanguage,
    subdomain,
  }: {
    name: string;
    sourceLanguage: string;
    description?: string;
    subdomain: string;
  }): ProjectEntity {
    return new ProjectEntity({
      id: v4(),
      name,
      sourceLanguage,
      description: null,
      subdomain,
      enabled: true,
      translationEnabled: true,
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private isValid() {
    if (!this.props.id) {
      throw new UnexpectedException({ message: 'id is required' });
    }
  }

  public beforeUpdateValidate(): void {
    this.isValid();
  }

  public beforeInsertValidate(): void {
    this.isValid();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get sourceLanguage(): string {
    return this.props.sourceLanguage;
  }

  get subdomain(): string {
    return this.props.subdomain;
  }

  get translationEnabled(): boolean {
    return this.props.translationEnabled;
  }

  get sourceLanguageCode(): LanguageCode | null {
    return getLanguageCodeType(this.sourceLanguage);
  }

  isTranslationEnabled(targetIsoLngCode: string): boolean {
    const targetLngType = getLanguageCodeType(targetIsoLngCode);

    return (
      env.DEEPL_API_KEY &&
      this.translationEnabled &&
      this.sourceLanguageCode?.sourceLanguageCode &&
      targetLngType?.targetLanguageCode &&
      this.sourceLanguageCode?.code !== targetLngType?.code
    );
  }

  updateProject(name?: string, sourceLanguage?: string) {
    if (name) {
      this.props.name = name;
    }

    if (sourceLanguage) {
      this.props.sourceLanguage = sourceLanguage;
    }
  }
}
