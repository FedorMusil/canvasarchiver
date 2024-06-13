import { useState, useEffect, FC, ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import Comments from "./Comment";
import { getAnnotations } from "../../api/annotation";

interface User {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  user: User;
  text: string;
  selectedText: string | null;
  selectionStart: number;
  selectionEnd: number;
  timestamp: Date;
  parentId: number | null;
}

const userInfo = [{ id: 3, name: 'Adam' }];

const CommentContainer: FC = (): ReactElement => {
  const { data: annotations, isError, isLoading, error } = useQuery<Comment[], Error>({
    queryKey: ['annotations', 1],
    queryFn: () => getAnnotations(1)
  });

  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments');
    return savedComments ? JSON.parse(savedComments) : [];
  });
  const [selectionText, setSelectionText] = useState('');
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [showTextarea, setShowTextarea] = useState(false);
  const [textareaPosition, setTextareaPosition] = useState({ top: 0, left: 0 });
  const [highlightedComment, setHighlightedComment] = useState<Comment | null>(null);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = selection.toString();
      const start = range.startOffset;
      const end = start + text.length;

      if (text.length > 0) {
        setSelectionText(text);
        setSelectionStart(start);
        setSelectionEnd(end);
        setTextareaPosition({ top: rect.bottom, left: rect.left });
        setShowTextarea(true);
      }
    }
  };

  useEffect(() => {
    if (annotations && annotations.length > 0) {
      setComments(annotations);
    }
  }, [annotations]);

  {/* Save commentList to localStorage on any update to ensure persistence across sessions */ }
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  if (isLoading) return <div>Loading...</div>;
  if (isError || annotations === undefined) return <div>Error: {error?.message}</div>;

  const outerDivStyle = "w-1/4 bg-gray-100 p-6 border border-gray-200";

  const handleSetComments = (newComment: Comment) => {
    setComments((prevComments: Comment[]) => [...prevComments, newComment]);
  };

  const addCommentFromSelection = () => {
    const newComment: Comment = {
      id: Math.max(0, ...comments.map((c: Comment) => c.id)) + 1,
      user: userInfo[0],
      text: newCommentText,
      selectedText: selectionText,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      timestamp: new Date(),
      parentId: null,
    };
    handleSetComments(newComment);
    setNewCommentText('');
    setShowTextarea(false);
  };

  const addNewComment = () => {
    const savedComments = localStorage.getItem('comments')
    if (savedComments) {
      setComments([...JSON.parse(savedComments)]);
      console.log("local:", JSON.parse(savedComments));
    }
    const newComment: Comment = {
      id: Math.max(0, ...comments.map((c: Comment) => c.id)) + 1,
      user: userInfo[0],
      text: newCommentText,
      selectedText: selectionText,
      selectionStart: 0,
      selectionEnd: 0,
      timestamp: new Date(),
      parentId: null,
    };
    handleSetComments(newComment);
    setNewCommentText('');
  };

  const renderHighlightedText = (fullText: string, comment: Comment) => {
    if (!comment.selectedText) return fullText;

    const beforeText = fullText.substring(0, comment.selectionStart);
    const afterText = fullText.substring(comment.selectionEnd);
    const highlightedText = fullText.substring(comment.selectionStart, comment.selectionEnd);

    return (
      <>
        {beforeText}
        <span className="highlight bg-yellow-300">{highlightedText}</span>
        {afterText}
      </>
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
            {highlightedComment ? renderHighlightedText("Hello, world!", highlightedComment) : "Hello, world!"}
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
          <Comments comments={comments} setComments={setComments} parentId={null} user={userInfo[0]} setHighlightedComment={setHighlightedComment} />
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
};
export default CommentContainer;
