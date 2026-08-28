import MessageBubble from "./MessageBuble";
import JobPostMessageCard from "./JopPostMessageCard";
import HireOfferCard from "./HireOfferCard";

import { useEffect, useRef } from "react";

export default function ConversationTimeline({
  items,
  onOfferUpdated,
}) {
  const timelineRef = useRef(null);
  const previousItemCountRef = useRef(0);

  useEffect(() => {
    if (!timelineRef.current) return;

    requestAnimationFrame(() => {
      if (!timelineRef.current) return;

      const isInitialLoad =
        previousItemCountRef.current === 0;

      timelineRef.current.scrollTo({
        top: timelineRef.current.scrollHeight,
        behavior: isInitialLoad ? "auto" : "smooth",
      });

      previousItemCountRef.current =
        items?.length || 0;
    });
  }, [items]);

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
    <div
      className="conversation-timeline"
      ref={timelineRef}
    >
      {items.map((item, index) => {
        const key =
          item.message?.messageId
            ? `message-${item.message.messageId}`
            : item.jobPost?.jobPostId
              ? `jobPost-${item.jobPost.jobPostId}`
              : item.hireOffer?.hireOfferId
                ? `hireOffer-${item.hireOffer.hireOfferId}`
                : `${item.type}-${index}`;

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
              <HireOfferCard
                key={key}
                item={item}
                onOfferUpdated={onOfferUpdated}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}