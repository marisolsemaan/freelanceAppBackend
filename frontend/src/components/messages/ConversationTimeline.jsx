import MessageBubble from "./MessageBuble";
import JobPostMessageCard from "./JopPostMessageCard";
import HireOfferCard from "./HireOfferCard";

import { useEffect, useRef,} from "react";


export default function ConversationTimeline({ items, onOfferUpdated,}) {
  const bottomRef =
    useRef(null);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
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
              <HireOfferCard
                key={key}
                item={item}
                onOfferUpdated={
                  onOfferUpdated
                }
              />
            );


          default:
            return null;
        }
      })}


      <div ref={bottomRef} />

    </div>
  );
}