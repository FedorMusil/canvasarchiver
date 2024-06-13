import { useState, useEffect } from "react";


interface User {
    id: number;
    name: string;
}

interface Comment {
    id: number;
    user: User;
    text: string;
    selectedText: string | null;
    selectionStart: number,
    selectionEnd: number,
    timestamp: Date;
    parentId: number | null;
}

interface CommentsProps {
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    parentId?: number | null;
    user: User;
    setHighlightedComment: (text: Comment | null) => void;
}

const userInfo = [{ id: 3, name: 'Adam' }];

function Comments({ comments, setComments, parentId = null, user, setHighlightedComment }: CommentsProps) {
    const [replyContent, setReplyContent] = useState('');
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

    {/* Save commentList to localStorage on any update to ensure persistence across sessions */ }
    useEffect(() => {
        localStorage.setItem('comments', JSON.stringify(comments));
    }, [comments]);

    const handleDelete = (commentId: number) => {
        const filteredComments = comments.filter(comment => comment.id !== commentId);
        setComments(filteredComments);
    };

    const handleReplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReplyContent(event.target.value);
    };

    const submitReply = (parentId: number) => {
        if (replyContent.trim() !== '') {
            const newComment = {
                id: Math.max(0, ...comments.map(c => c.id)) + 1,
                user: user,
                text: replyContent,
                selectedText: null,
                selectionStart: 0,
                selectionEnd: 0,
                timestamp: new Date(),
                parentId: parentId,
            };
            setComments([...comments, newComment]);
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
        const parent = comments.find((comment: Comment) => comment.id === parentId);
        return parent ? parent.user.name : null;
    };

    const nestedCommentStyle = "mt-1 p-4 bg-white rounded-lg break-words";

    return (
        <>
            {comments.filter(c => c.parentId === parentId).map((comment) => (
                <div key={comment.id} className={nestedCommentStyle}>
                    <p className="text-sm text-gray-700"
                        onMouseEnter={() => setHighlightedComment(comment)}
                        onMouseLeave={() => setHighlightedComment(null)}>
                        {comment.parentId && ( // handle (sub)comments
                            <>
                                reply to <span className="font-bold">{findParentAuthor(comment.parentId)}</span>:&nbsp;
                            </>
                        )}
                        {comment.text.length > 50 ? `${comment.text.slice(0, 50)}\n${comment.text.slice(50)}`// break if the content has >50 characters
                            : comment.text} &nbsp;&nbsp;- <span className="font-bold">{comment.user.name}</span>
                    </p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-500 text-xs">{comment.timestamp.toLocaleString()}</p>
                        {(comment.user.id === userInfo[0].id) && ( // handle delete operation
                            <button onClick={() => handleDelete(comment.id)}
                                className="text-red-500 hover:text-red-700 font-medium rounded-lg text-sm p-2.5">
                                Delete
                            </button>
                        )}
                        {comment.user.name !== userInfo[0].name && ( // handle reply operation
                            <button onClick={() => setActiveReplyId(comment.id)}
                                className="text-gray-500 hover:text-gray-700 font-medium rounded-lg text-sm p-2.5">
                                Reply
                            </button>
                        )}
                    </div>
                    {/* Submit and render new subcomment */}
                    {activeReplyId === comment.id && renderReplyBox(comment.id)}
                    <Comments comments={comments} setComments={setComments} parentId={comment.id} user={user} setHighlightedComment={setHighlightedComment} />
                </div>
            ))}
        </>
    );
}
export default Comments;
