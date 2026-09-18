type MessageActionButtonsProps = {
  messageId: number
  messageText: string
  onResetConversation: () => void
  onCopyMessage: (text: string) => Promise<void>
  onFeedback: (messageId: number, type: 'like' | 'dislike') => void
  feedback?: 'like' | 'dislike' | undefined
}

function ThumbsUpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

export function MessageActionButtons({
  messageId,
  messageText,
  onCopyMessage,
  onFeedback,
  feedback,
}: MessageActionButtonsProps) {
  return (
    <div className="message-actions">
      <button
        type="button"
        className={feedback === 'like' ? 'message-action active' : 'message-action'}
        title="Good response"
        onClick={() => onFeedback(messageId, 'like')}
      >
        <ThumbsUpIcon />
      </button>
      <button
        type="button"
        className={feedback === 'dislike' ? 'message-action active' : 'message-action'}
        title="Bad response"
        onClick={() => onFeedback(messageId, 'dislike')}
      >
        <ThumbsDownIcon />
      </button>
      <button
        type="button"
        className="message-action"
        title="Copy text"
        onClick={() => onCopyMessage(messageText)}
      >
        <CopyIcon />
      </button>
    </div>
  )
}