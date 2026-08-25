import MessageBubble from "./MessageBuble";
import JobPostMessageCard from "./JopPostMessageCard";

export default function ConversationTimeline({items,})
{
  if (!items?.length) {
    return (
      <div className="conversation-empty-timeline">
        <i className="bi bi-chat-text"></i>

        <p>
          No messages yet.
        </p>
      </div>
    );
  }

  return (
    <div className="conversation-timeline">
      {items.map((item, index) => {
        const key =
          item.message?.messageId ||
          item.jobPost?.jobPostId ||
          item.hireOffer?.hireOfferId ||
          `${item.type}-${index}`;

        switch (item.type) {
          case "Message":
            return (
              <MessageBubble
                key={key}
                item={item}
              />
            );

          case "JobPost":
            return (
              <JobPostMessageCard
                key={key}
                item={item}
              />
            );

          case "HireOffer":
            return (
              <div
                key={key}
                className="timeline-pending-component"
              >
                Hire offer
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}