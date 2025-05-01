import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AnalysisMarkdown({ gu }) {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!gu) {
      setMarkdown("⚠️ 지역을 선택하면 분석 리포트가 나타납니다.");
      return;
    }

    fetch(`/analysis_notes/${gu}.md`)
      .then(res => {
        if (!res.ok) throw new Error("리포트 없음");
        return res.text();
      })
      .then(setMarkdown)
      .catch(() =>
        setMarkdown("📌 해당 지역의 분석 리포트가 아직 준비되지 않았습니다.")
      );
  }, [gu]);

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        lineHeight: "1.8",
        fontSize: "1rem",
        overflowX: "auto",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                backgroundColor: "#efefef",
                fontWeight: "bold",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                border: "1px solid #ddd",
                padding: "10px",
              }}
              {...props}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
