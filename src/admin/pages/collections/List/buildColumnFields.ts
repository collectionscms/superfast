import { Type } from '@admin/components/elements/Table/Cell/types';
import { ColumnField } from '@admin/components/elements/Table/types';
import { Field } from '@shared/types';

const buildColumnFields = (fields: Field[]): ColumnField[] => {
  return fields
    .filter((field) => !field.hidden)
    .map((field) => {
      return {
        field: field.field,
        label: field.label,
        type: toType(field.interface),
      };
    });
};

const toType = (fieldInterface: string): (typeof Type)[keyof typeof Type] => {
  switch (fieldInterface) {
    case 'input':
    case 'input-multiline':
    case 'input-rich-text-html':
    case 'input-rich-text-md':
      return Type.Text;
  }

  return Type.Object;
};

export default buildColumnFields;
