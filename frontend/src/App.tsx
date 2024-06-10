// import Home from './components/pages/Home';
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { FC, ReactElement } from 'react';
// import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
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

// const date = new Date().toISOString().split('T')[0];
// const commentsData = [
//   { id: 1, author: 'Tim Bos', content: 'Goed Bewerkt!', date: date, parentId: null, isOwner: false },
//   { id: 2, author: 'Adobe ComMij', content: 'Het wordt beter als je extra uitleg erin toevoegt.', date: date, parentId: null, isOwner: false },
//   { id: 3, author: 'Adam Usij', content: 'Ja', date: date, parentId: 2, isOwner: true },
//   { id: 4, author: 'Abc Def', content: 'Goed gedaan', date: date, parentId: null, isOwner: false },
// ];

const userInfo = [{ id: 3, name: 'Adam Usij' }];

interface User {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  selectedText: string | null;
  date: string;
  parentId: number | null;
  isOwner: boolean;
}

interface CommentsProps {
  comments: Comment[];
  parentId?: number | null;
  user: User;
  setHighlightedText: (text: string | null) => void;
}

function Comments({ comments, parentId = null, user, setHighlightedText }: CommentsProps) {
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [replyContent, setReplyContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const handleDelete = (commentId: number) => {
    const filteredComments = comments.filter(comment => comment.id !== commentId);
    setCommentList(filteredComments);
  };

  {/* Sync local state with external props whenever the comments prop updates */ }
  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  {/* Save commentList to localStorage on any update to ensure persistence across sessions */ }
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(commentList));
  }, [commentList]);

  const handleReplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReplyContent(event.target.value);
  };

  const submitReply = (parentId: number) => {
    if (replyContent.trim() !== '') {
      const newComment = {
        id: Math.max(0, ...commentList.map(c => c.id)) + 1,
        author: user.name,
        content: replyContent,
        selectedText: null,
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
      <button onClick={() => submitReply(commentId)}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
        Submit
      </button>
    </div>
  );

  const findParentAuthor = (parentId: number): string | null => {
    const parent = commentList.find((comment: Comment) => comment.id === parentId);
    return parent ? parent.author : null;
  };

  const nestedCommentStyle = "mt-1 p-4 bg-white rounded-lg break-words";

  return (
    <>
      {commentList.filter(c => c.parentId === parentId).map((comment) => (
        <div key={comment.id}
          className={nestedCommentStyle}
          onMouseEnter={() => setHighlightedText(comment.selectedText)}
          onMouseLeave={() => setHighlightedText(null)}>

          <p className="text-sm text-gray-700">
            {comment.parentId && ( // handle (sub)comments
              <>
                reply to <span className="font-bold">{findParentAuthor(comment.parentId)}</span>:&nbsp;
              </>
            )}
            {comment.content.length > 50 ? `${comment.content.slice(0, 50)}\n${comment.content.slice(50)}`// break if the content has >50 characters
              : comment.content} &nbsp;&nbsp;- <span className="font-bold">{comment.author}</span>
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-500 text-xs">{comment.date}</p>
            {comment.isOwner && ( // handle delete operation
              <button onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:text-red-700 font-medium rounded-lg text-sm p-2.5">
                Delete
              </button>
            )}
            {comment.author !== user.name && ( // handle reply operation
              <button onClick={() => setActiveReplyId(comment.id)}
                className="text-gray-500 hover:text-gray-700 font-medium rounded-lg text-sm p-2.5">
                Reply
              </button>
            )}
          </div>
          {/* Submit and render new subcomment */}
          {activeReplyId === comment.id && renderReplyBox(comment.id)}
          <Comments comments={commentList} parentId={comment.id} user={user} setHighlightedText={setHighlightedText} />
        </div>
      ))}
    </>
  );
}

export default function App() {
  const outerDivStyle = "w-1/4 bg-gray-100 p-6 border border-gray-200";
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments');
    return savedComments ? JSON.parse(savedComments) : [];
  });
  const [selectionText, setSelectionText] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [textareaPosition, setTextareaPosition] = useState({ top: 0, left: 0 });
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  useEffect(() => {
    function handleTextSelection() {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const text = selection.toString();
        if (text.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionText(text);
          setTextareaPosition({ top: rect.bottom, left: rect.left });
          setShowTextarea(true);
        }
      }
    }
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const addCommentFromSelection = () => {
    const newComment: Comment = {
      id: Math.max(0, ...comments.map((c: Comment) => c.id)) + 1,
      author: userInfo[0].name,
      content: newCommentText,
      selectedText: selectionText,
      date: new Date().toISOString().split('T')[0],
      parentId: null,
      isOwner: true
    };
    setComments([...comments, newComment]);
    setNewCommentText('');
    setShowTextarea(false);
  };

  const addNewComment = () => {
    const newComment: Comment = {
      id: Math.max(0, ...comments.map((c: Comment) => c.id)) + 1,
      author: userInfo[0].name,
      content: newCommentText,
      selectedText: selectionText,
      date: new Date().toISOString().split('T')[0],
      parentId: null,
      isOwner: true
    };
    const newComments = [...comments, newComment];
    setComments(newComments);
    setNewCommentText('');
  };

  const renderHighlightedText = (text: string, search: string) => {
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="highlight bg-yellow-300">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col w-full min-h-[950px] px-40 py-5 bg-white">
      {/* Course History Section */}
      <div className="bg-white p-4 mb-2">
        <h1 className="text-xl font-bold">Course History</h1>
      </div>

      <div className="border-b border-gray-200"></div>
      <h3 className="p-2 font-semibold text-lg">Subject Version Control</h3>

      {/* Content Sections */}
      <div className="flex flex-1">
        {/* Textarea for selected text */}
        <div className="flex-1 border">
          <h2>
            {highlightedText ? renderHighlightedText("Hello, world!", highlightedText) : "Hello, world!"}
          </h2>
          {showTextarea && (
            <div style={{ position: 'absolute', top: textareaPosition.top + 'px', left: textareaPosition.left + 'px' }}>
              <textarea
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Type your comment here..."
                className="p-2 border rounded"
                style={{ minHeight: "50px", width: "300px" }}
              />
              <button
                onClick={addCommentFromSelection}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-2"
              >
                Add Comment
              </button>
            </div>
          )}
        </div>
        {/* Right Side Space */}
        <div className={outerDivStyle}>
          {/* Render stored comments */}
          <h2 className="text-xl font-bold mb-5">Annotated Comments</h2>
          <Comments comments={comments} parentId={null} user={userInfo[0]} setHighlightedText={setHighlightedText} />
          {/* Add new comment section*/}
          <div className="mt-4">
            <textarea
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Type your new comment here..."
              className="mt-2 p-2 w-full border rounded resize-none overflow-hidden"
              style={{ minHeight: "50px" }}
            />
            <button
              onClick={addNewComment}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
