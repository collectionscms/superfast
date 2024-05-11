import { Role, User } from '@prisma/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MainCard } from '../../@extended/components/MainCard/index.js';
import { CreateNewButton } from '../../components/elements/CreateNewButton/index.js';
import { Link } from '../../components/elements/Link/index.js';
import { Cell } from '../../components/elements/Table/Cell/index.js';
import { cells } from '../../components/elements/Table/Cell/types.js';
import { Table } from '../../components/elements/Table/index.js';
import { ComposeWrapper } from '../../components/utilities/ComposeWrapper/index.js';
import { buildColumns } from '../../utilities/buildColumns.js';
import { UserContextProvider, useUser } from './Context/index.js';

const UserPageImpl: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getUsers } = useUser();
  const { data } = getUsers();

  const fields = [
    { field: 'name', label: t('name'), type: cells.text() },
    { field: 'email', label: t('email'), type: cells.text() },
    { field: 'role', label: t('role'), type: cells.text() },
  ];

  const columns = buildColumns(fields, (i: number, row: User & { role: Role }, data: any) => {
    const defaultCell = <Cell colIndex={i} type={fields[i].type} cellData={data} />;

    switch (fields[i].field) {
      case 'role':
        return <Cell colIndex={i} type={fields[i].type} cellData={row.role.name} />;
      case 'name':
        return <Link href={`${row.id}`}>{defaultCell}</Link>;
      default:
        return defaultCell;
    }
  });

  return (
    <MainCard
      content={false}
      title={<></>}
      secondary={
        <CreateNewButton
          options={{
            subject: t('add'),
          }}
          onClick={() => navigate('create')}
        />
      }
    >
      <Table columns={columns} rows={data} />
    </MainCard>
  );
};

export const UserPage = ComposeWrapper({ context: UserContextProvider })(UserPageImpl);
