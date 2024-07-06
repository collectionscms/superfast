import { EllipsisOutlined } from '@ant-design/icons';
import { Divider, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PostItem } from '../../../types/index.js';
import { IconButton } from '../../@extended/components/IconButton/index.js';
import { MainCard } from '../../@extended/components/MainCard/index.js';
import { CreateNewButton } from '../../components/elements/CreateNewButton/index.js';
import { Link } from '../../components/elements/Link/index.js';
import { StatusDot } from '../../components/elements/StatusDot/index.js';
import { Cell } from '../../components/elements/Table/Cell/index.js';
import { cells } from '../../components/elements/Table/Cell/types.js';
import { Table } from '../../components/elements/Table/index.js';
import { useAuth } from '../../components/utilities/Auth/index.js';
import { ComposeWrapper } from '../../components/utilities/ComposeWrapper/index.js';
import { buildColumns } from '../../utilities/buildColumns.js';
import { PostContextProvider, usePost } from './Context/index.js';
import { RowMenu } from './RowMenu/index.js';
import dayjs from 'dayjs';

export const PostPageImpl: React.FC = () => {
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getPosts, createPost } = usePost();
  const { data: posts, mutate } = getPosts();
  const { trigger } = createPost();

  const [menu, setMenu] = useState<EventTarget | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostItem | undefined>();

  const fields = [
    { field: 'title', label: t('title'), type: cells.text() },
    { field: 'slug', label: t('slug'), type: cells.text() },
    { field: 'status', label: `${t('language')} / ${t('status')}`, type: cells.text() },
    { field: 'updatedAt', label: t('updated_at'), type: cells.date() },
    { field: 'action', label: '', type: cells.text(), width: 80 },
  ];

  const handleTrashSuccess = (postId: string) => {
    const trashedPost = posts.filter((post) => post.id !== postId);
    mutate(trashedPost);
    setMenu(null);
    enqueueSnackbar(t('toast.move_to_trash'), { variant: 'success' });
  };

  const handleCreatePost = async () => {
    const post = await trigger();
    navigate(`${post.id}`);
  };

  const handleOpenMenu = (currentTarget: EventTarget, post: PostItem) => {
    setSelectedPost(post);
    setMenu(currentTarget);
  };

  const columns = buildColumns(fields, (i: number, row: PostItem, data: any) => {
    const defaultCell = <Cell colIndex={i} type={fields[i].type} cellData={data} />;

    switch (fields[i].field) {
      case 'title':
        return hasPermission('updatePost') ? (
          <Link href={`${row.id}`}>{defaultCell}</Link>
        ) : (
          defaultCell
        );
      case 'status':
        return (
          <Stack gap={0.5}>
            {row.localeStatues.map(({ locale, statuses }) => {
              return (
                <Stack key={locale} direction="row" gap={1}>
                  <Typography sx={{ width: 30 }}>{locale}</Typography>
                  {statuses[0] !== 'published' && statuses.includes('published') && (
                    <>
                      <StatusDot status="published" isShowText={false} />
                      <Divider orientation="vertical" flexItem variant="middle" />
                    </>
                  )}
                  <StatusDot status={statuses[0]} />
                </Stack>
              );
            })}
          </Stack>
        );
      case 'updatedAt':
        return (
          <Stack direction="row" gap={1}>
            <Typography>{dayjs(row.updatedAt).format('YYYY-MM-DD')}</Typography>
            <Typography>
              {t('updater')}: {row.updatedByName}
            </Typography>
          </Stack>
        );
      case 'action':
        return (
          <IconButton
            color="secondary"
            shape="rounded"
            size="small"
            onClick={(e) => handleOpenMenu(e.currentTarget, row)}
          >
            <EllipsisOutlined style={{ fontSize: 16 }} />
          </IconButton>
        );
      default:
        return defaultCell;
    }
  });

  return (
    <>
      {selectedPost && (
        <RowMenu
          postId={selectedPost.id}
          menu={menu}
          onTrashSuccess={handleTrashSuccess}
          onClose={() => setMenu(null)}
        />
      )}
      <MainCard
        content={false}
        title={<></>}
        secondary={hasPermission('createPost') && <CreateNewButton onClick={handleCreatePost} />}
      >
        <Table columns={columns} rows={posts} />
      </MainCard>
    </>
  );
};

export const PostPage = ComposeWrapper({ context: PostContextProvider })(PostPageImpl);
