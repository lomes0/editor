"use client"
import { useRouter } from 'next/navigation';
import RouterLink from 'next/link'
import { useDispatch, useSelector, actions } from '@/store';
import DocumentCard from "./DocumentCard";
import { memo, useEffect } from "react";
import { BackupDocument, User, UserDocument } from '@/types';
import { validate } from "uuid";
import UserCard from "./UserCard";
import documentDB, { revisionDB } from '@/indexeddb';
import { Box, Avatar, Button, Typography, Grid, Card, CardActionArea, CardHeader, Collapse, Pagination } from '@mui/material';
import { PostAdd, UploadFile, Help, Storage, Science, Pageview } from '@mui/icons-material';
import DocumentSortControl, { sortDocuments } from './DocumentSortControl';
import DocumentFilterControl, { filterDocuments } from './DocumentFilterControl';
import { v4 as uuid } from 'uuid';

const Documents: React.FC = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const initialized = useSelector(state => state.ui.initialized);
  const documents = useSelector(state => state.documents);

  useEffect(() => {
    if ("launchQueue" in window && "LaunchParams" in window) {
      (window as any).launchQueue.setConsumer(
        async (launchParams: { files: FileSystemFileHandle[] }) => {
          if (!launchParams.files.length) return;
          const files = await Promise.all(launchParams.files.map(async file => file.getFile()));
          await handleFilesChange(files);
        },
      );
    }
  }, []);

  const handleFilesChange = async (files: FileList | File[] | null) => {
    if (!files?.length) return;
    for (const file of files) await loadFromFile(file, files.length === 1);
  }

  async function loadFromFile(file: File, shouldNavigate?: boolean) {
    const reader = new FileReader();
    reader.readAsText(file);
    await new Promise<void>(resolve => {
      reader.onload = async () => {
        try {
          const data: BackupDocument | BackupDocument[] = JSON.parse(reader.result as string);
          if (!Array.isArray(data)) {
            validate(data.id) && await addDocument(data, shouldNavigate);
          } else {
            for (const document of data) {
              validate(document.id) && await addDocument(document);
            }
          }
        } catch (error) {
          dispatch(actions.announce({ message: { title: "Invalid file", subtitle: "Please select a valid .me file" } }));
        } finally {
          resolve();
        }
      }
    })
  }

  async function addDocument(document: BackupDocument, shouldNavigate?: boolean) {
    const revisions = document.revisions || [];
    if (!document.head) document.head = uuid();
    const isHeadLocalRevision = !!revisions.find(revision => revision.id === document.head);
    if (!isHeadLocalRevision) {
      document.revisions = [
        {
          id: document.head,
          documentId: document.id,
          data: document.data,
          createdAt: document.updatedAt
        },
        ...revisions
      ];
    }
    if (documents.find(d => d.id === document.id && d.local)) {
      const alert = {
        title: `Document already exists`,
        content: `Do you want to overwrite ${document.name}?`,
        actions: [
          { label: "Cancel", id: uuid() },
          { label: "Overwrite", id: uuid() }
        ]
      };
      const response = await dispatch(actions.alert(alert));
      if (response.payload === alert.actions[1].id) {
        dispatch(actions.updateLocalDocument({ id: document.id, partial: document })).then(() => { if (shouldNavigate) navigate(`/edit/${document.id}`) });
      }
    } else {
      dispatch(actions.createLocalDocument(document)).then(() => {
        shouldNavigate && navigate(`/edit/${document.id}`);
      });
    }
  }

  async function backup() {
    try {
      const documents = await documentDB.getAll();
      const revisions = await revisionDB.getAll();
      const data: BackupDocument[] = documents.map(document => ({
        ...document,
        revisions: revisions.filter(revision => revision.documentId === document.id && revision.id !== document.head)
      }));

      const blob = new Blob([JSON.stringify(data)], { type: "text/json" });
      const link = window.document.createElement("a");

      const now = new Date();
      link.download = now.toISOString() + ".me";
      link.href = window.URL.createObjectURL(blob);
      link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

      const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      link.dispatchEvent(evt);
      link.remove();
    } catch (error) {
      dispatch(actions.announce({ message: { title: "Backup failed", subtitle: "Please try again" } }));
    };
  };

  const sort = useSelector(state => state.ui.sort);
  const setSort = (payload: Partial<{ key: string, direction: "asc" | "desc" }>) => dispatch(actions.setSort(payload));
  const filter = useSelector(state => state.ui.filter);
  const setFilter = (value: number) => dispatch(actions.setFilter(value));

  const filteredDocuments = filterDocuments(documents, user, filter);
  const sortedDocuments = sortDocuments(filteredDocuments, sort);

  return (
    <>
      <Box sx={{ justifyContent: { xs: "space-around", sm: "space-between" }, alignItems: "center", gap: 1, mb: 1 }}>
        {/*<Typography variant="h6" component="h2" sx={{ display: { xs: 'none', sm: 'block' } }}>Documents</Typography>*/}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center", mb: 1 }}>
          <DocumentSortControl value={sort} setValue={setSort} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
            <Button variant="outlined" startIcon={<UploadFile />} component="label">
              Import
              <input type="file" hidden accept=".me" multiple onChange={e => handleFilesChange(e.target.files)} />
            </Button>
            <Button variant="outlined" startIcon={<Storage />} onClick={backup}>
              Backup
            </Button>
		    {/*<Avatar sx={{ my: 2, bgcolor: 'primary.main' }}><PostAdd /></Avatar>*/}
            <Button variant="outlined" component={RouterLink} prefetch={false} scroll={false} href="/new">New document</Button>
          </Box>
        </Box>
      </Box>
	  {/*<Collapse timeout={1000} in={!(user && initialized)} unmountOnExit><Box sx={{ mb: 2 }}><UserCard user={user} /></Box></Collapse>*/}
	  <br/>
      <DocumentsGrid documents={sortedDocuments} initialized={initialized} user={user} />
	</>
  )
}

const DocumentsGrid: React.FC<{ documents: UserDocument[], user?: User, initialized: boolean }> = memo(({ documents, user, initialized }) => {
  const dispatch = useDispatch();
  const showSkeletons = !initialized && !documents.length;
  const showEmpty = initialized && !documents.length;
  const pageSize = 12;
  const pages = Math.ceil(documents.length / pageSize);
  const savedPage = useSelector(state => state.ui.page);
  const page = Math.min(savedPage, pages);
  const handlePageChange = (_: any, value: number) => dispatch(actions.setPage(value));
  const pageDocuments = documents.slice((page - 1) * pageSize, page * pageSize);

  return <Grid container spacing={2}>
    {showSkeletons && Array.from({ length: 6 }).map((_, i) => <Grid item key={i} xs={12} sm={6} md={4}><DocumentCard /></Grid>)}
    {showEmpty && <Grid item xs={12} sx={{ display: 'flex', flexDirection: "column", alignItems: "center", my: 5, gap: 2 }}>
      <Pageview sx={{ width: 64, height: 64, fontSize: 64 }} />
      <Typography variant="overline" component="p">No documents found</Typography>
    </Grid>}
    {pageDocuments.map(document => <Grid item key={document.id} xs={12} sm={6} md={4}>
      <DocumentCard userDocument={document} user={user} />
    </Grid>)}
    {pages > 1 && <Pagination count={pages} page={page} onChange={handlePageChange} sx={{ display: "flex", justifyContent: "center", mt: 3, width: "100%" }} />}
  </Grid>
});

export default Documents;
