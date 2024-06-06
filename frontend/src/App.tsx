import Home from './components/pages/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FC, ReactElement } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import './globals.css';


// const App: FC = (): ReactElement => {
//   const queryClient = new QueryClient();

//   return (
//       <QueryClientProvider client={queryClient}>
//           <BrowserRouter>
//               <Routes>
//                   <Route path='/' element={<Home />} />
//               </Routes>
//           </BrowserRouter>

//           {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
//       </QueryClientProvider>
//   );
// };
// export default App;

// const App = () => {
//   const [data, setData] = useState<{ text: string, user: string }[]>([]);
//   const changeId = 1;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch annotations
//         const annotations = await getAnnotations(changeId);

//         // Fetch users for each annotation
//         const userPromises = annotations.map(annotation => getUser({ queryKey: ['user', annotation.id] }));
//         const users = await Promise.all(userPromises);

//         // Extract text from annotations and corresponding user names from users
//         const extractedData = annotations.map((annotation, index) => ({
//           text: annotation.text,
//           user: users[index].name,
//         }));

//         setData(extractedData);
//       } catch (error) {
//         console.error('Failed to fetch data', error);
//       }
//     };

//     fetchData();
//   }, [changeId]);

//   return (
//     <div>
//       <h1>Annotations</h1>
//       <ul>
//         {data.map((item, index) => (
//           <li key={index}>
//             <strong>{item.user}:</strong> {item.text}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default App;


const commentsData = [
  { id: 1, author: 'Tim Bos', content: 'Goed Bewerkt!', date: '05/06/2024', parentId: null, isOwner: false },
  { id: 2, author: 'Adobe ComMij', content: 'Het wordt beter als je extra uitleg erin toevoegt.', date: '05/06/2024', parentId: null, isOwner: false },
  { id: 3, author: 'Adam Usij', content: 'Ja', date: '05/06/2024', parentId: 2, isOwner: true },
  { id: 4, author: 'Abc Def', content: 'Goed gedaan', date: '05/06/2024', parentId: null, isOwner: false }
];

const userInfo = [{ id: 3, name: 'Adam Usij' }];

interface User {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  parentId: number | null;
  isOwner: boolean
}

interface CommentsProps {
  comments: Comment[];
  parentId?: number | null;
  isRoot?: boolean;
  user: User;
}

function Comments({ comments, parentId = null, isRoot = true, user }: CommentsProps) {
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [replyContent, setReplyContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const handleDelete = (commentId: number) => {
    setCommentList(commentList.filter(comment => comment.id !== commentId));
  };

  // useEffect(() => {
  //   console.log('Comment List Updated:', commentList);
  // }, [commentList]);

  const handleReplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReplyContent(event.target.value);
  };

  const submitReply = (parentId: number) => {
    if (replyContent.trim() !== '') {
      const newComment = {
        id: Math.max(0, ...commentList.map(c => c.id)) + 1,
        author: user.name,
        content: replyContent,
        date: new Date().toISOString().split('T')[0],
        parentId,
        isOwner: true
      };
      setCommentList([...commentList, newComment]);
      setReplyContent('');
      setActiveReplyId(null);
    }
  };

  const renderReplyBox = (commentId: number) => (
    <div>
      <input
        type="text"
        value={replyContent}
        onChange={handleReplyChange}
        placeholder="Type your reply here..."
        className="mt-2 p-1 border rounded"
      />
      <button onClick={() => submitReply(commentId)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
        Submit
      </button>
    </div>
  );

  const findParentAuthor = (parentId: number): string | null => {
    const parent = commentList.find((comment: Comment) => comment.id === parentId);
    return parent ? parent.author : null;
  };

  const nestedCommentStyle = "ml-4 border-l-2 pl-4 border-gray-200";
  const outerDivStyle = isRoot ? "bg-white p-6 max-w-md mx-auto rounded-lg border border-gray-200 shadow-md min-h-[920px]" : "";

  return (
    <div className={outerDivStyle}>
      {isRoot && <h5 className="text-lg font-bold leading-none text-center mb-4">Annotated Comments</h5>}
      {commentList.filter(c => c.parentId === parentId).map((comment: Comment) => (
        <div key={comment.id} className={`mt-4 p-4 bg-gray-100 rounded-lg ${!isRoot && nestedCommentStyle}`}>
          {/* Render the content */}
          <p className="text-sm text-gray-700">
            {comment.parentId && (
              <>
                reply to <span className="font-bold">{findParentAuthor(comment.parentId)}</span>:&nbsp;
              </>
            )}
            {comment.content} &nbsp;&nbsp;- <span className="font-bold">{comment.author}</span>
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-500 text-xs">{comment.date}</p>
            {/* Render delete and reply buttons */}
            {comment.isOwner && (
              <button onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:text-red-700 font-medium rounded-lg text-sm p-2.5">
                Delete
              </button>
            )}
            {comment.author !== user.name && (
              <button onClick={() => setActiveReplyId(comment.id)} className="text-gray-500 hover:text-gray-700 font-medium rounded-lg text-sm p-2.5">
                Reply
              </button>
            )}
          </div>
          {activeReplyId === comment.id && renderReplyBox(comment.id)}
          {/* Recursive call to render the subcomment */}
          <Comments comments={commentList} parentId={comment.id} isRoot={false} user={userInfo[0]} />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return <Comments comments={commentsData} parentId={null} isRoot={true} user={userInfo[0]} />;
}
