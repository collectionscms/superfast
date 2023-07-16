import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { MainCard } from 'superfast-ui';
import { User } from '../../../config/types.js';
import { CreateNewButton } from '../../components/elements/CreateNewButton/index.js';
import { Cell } from '../../components/elements/Table/Cell/index.js';
import { Type } from '../../components/elements/Table/Cell/types.js';
import { Table } from '../../components/elements/Table/index.js';
import { ComposeWrapper } from '../../components/utilities/ComposeWrapper/index.js';
import { buildColumns } from '../../utilities/buildColumns.js';
import { UserContextProvider, useUser } from './Context/index.js';

const UserPageImpl: React.FC = () => {
  const { t } = useTranslation();
  const { getUsers } = useUser();
  const { data } = getUsers();

  const fields = [
    { field: 'user_name', label: t('user_name'), type: Type.Text },
    { field: 'name', label: t('name'), type: Type.Text },
    { field: 'email', label: t('email'), type: Type.Text },
    { field: 'api_key', label: t('api_key'), type: Type.Text },
    { field: 'role', label: t('role'), type: Type.Text },
    { field: 'updated_at', label: t('updated_at'), type: Type.Date },
  ];

  const columns = buildColumns(fields, (i: number, row: User, data: any) => {
    const defaultCell = <Cell colIndex={i} type={fields[i].type} cellData={data} />;

    switch (fields[i].field) {
      case 'name':
        return (
          <Cell
            colIndex={i}
            type={fields[i].type}
            cellData={`${row.last_name} ${row.first_name}`}
          />
        );
      case 'api_key':
        return <Cell colIndex={i} type={fields[i].type} cellData={row.api_key && t('valid')} />;
      case 'role':
        return <Cell colIndex={i} type={fields[i].type} cellData={row.role?.name} />;
      case 'user_name':
        return <RouterLink to={`${row.id}`}>{defaultCell}</RouterLink>;
      default:
        return defaultCell;
    }
  });

  return (
    <MainCard content={false} title={<></>} secondary={<CreateNewButton to="create" />}>
      {data !== undefined && <Table columns={columns} rows={data} />}
    </MainCard>
  );
};

export const UserPage = ComposeWrapper({ context: UserContextProvider })(UserPageImpl);
