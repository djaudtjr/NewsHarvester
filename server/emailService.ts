// Reference: SendGrid blueprint - Email sending service
import sgMail from "@sendgrid/mail";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { storage } from "./storage";
import type { Subscription, Article } from "@shared/schema";

// Reference: SendGrid blueprint - Get SendGrid client
let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=sendgrid",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (
    !connectionSettings ||
    !connectionSettings.settings.api_key ||
    !connectionSettings.settings.from_email
  ) {
    throw new Error("SendGrid not connected");
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    email: connectionSettings.settings.from_email,
  };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email,
  };
}

// Reference: OpenAI blueprint - Initialize OpenAI client
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate PDF summary of articles and save to disk
export async function generateNewsPDF(
  articles: Article[],
  keywords: string[],
  subscriptionId: string,
): Promise<{ buffer: Buffer; path: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          // Save PDF to archives folder
          const filename = `${subscriptionId}_${Date.now()}.pdf`;
          const pdfPath = join("server", "pdf_archives", filename);
          await writeFile(pdfPath, buffer);
          resolve({ buffer, path: `/api/pdf-archives/${filename}` });
        } catch (error) {
          reject(error);
        }
      });
      doc.on("error", reject);

      // Title
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("뉴스 요약 리포트", { align: "center" });
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`키워드: ${keywords.join(", ")}`, { align: "center" });
      doc
        .fontSize(10)
        .text(`생성일: ${new Date().toLocaleDateString("ko-KR")}`, {
          align: "center",
        });
      doc.moveDown(2);

      // Generate summaries for each article using OpenAI
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${i + 1}. ${article.title}`);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            `출처: ${article.source} | ${new Date(article.publishedAt).toLocaleString("ko-KR")}`,
          );
        doc.moveDown(0.5);

        // Use OpenAI to generate summary if description exists
        if (article.description) {
          try {
            const summary = await openai.chat.completions.create({
              model: "gpt-4o-mini", // Using gpt-5-mini for cost-effective article summarization
              messages: [
                {
                  role: "system",
                  content:
                    "당신은 뉴스 기사를 간결하게 요약하는 전문가입니다. 핵심 내용만 2-3문장으로 요약해주세요.",
                },
                {
                  role: "user",
                  content: `다음 뉴스 기사를 요약해주세요:\n\n제목: ${article.title}\n내용: ${article.description}`,
                },
              ],
              max_completion_tokens: 200,
            });

            const summaryText =
              summary.choices[0].message.content || article.description;
            doc
              .fontSize(11)
              .font("Helvetica")
              .text(summaryText, { align: "justify" });
          } catch (error) {
            console.error("Error generating summary with OpenAI:", error);
            doc
              .fontSize(11)
              .font("Helvetica")
              .text(article.description, { align: "justify" });
          }
        }

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("blue")
          .text(`원문: ${article.url}`, { link: article.url });
        doc.fillColor("black");
        doc.moveDown(1.5);

        // Add page break if needed
        if (i < articles.length - 1 && doc.y > 650) {
          doc.addPage();
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Send email with PDF attachment
export async function sendNewsSummaryEmail(
  subscription: Subscription,
  userEmail: string,
  articles: Article[],
): Promise<void> {
  let pdfPath: string | undefined;

  try {
    const { client, fromEmail } = await getUncachableSendGridClient();

    // Generate PDF and save to archives
    const pdfResult = await generateNewsPDF(
      articles,
      subscription.keywords,
      subscription.id,
    );
    const pdfBuffer = pdfResult.buffer;
    pdfPath = pdfResult.path;

    // Prepare email
    const msg = {
      to: userEmail,
      from: fromEmail,
      subject: `뉴스 요약 리포트: ${subscription.keywords.join(", ")}`,
      text: `안녕하세요,\n\n요청하신 키워드(${subscription.keywords.join(", ")})에 대한 뉴스 요약 리포트를 보내드립니다.\n\n총 ${articles.length}개의 기사가 포함되어 있습니다.\n\n첨부된 PDF 파일을 확인해주세요.`,
      html: `
        <h2>뉴스 요약 리포트</h2>
        <p>안녕하세요,</p>
        <p>요청하신 키워드(<strong>${subscription.keywords.join(", ")}</strong>)에 대한 뉴스 요약 리포트를 보내드립니다.</p>
        <p>총 <strong>${articles.length}개</strong>의 기사가 포함되어 있습니다.</p>
        <p>첨부된 PDF 파일을 확인해주세요.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">이 이메일은 자동으로 발송되었습니다.</p>
      `,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `news-summary-${new Date().toISOString().split("T")[0]}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await client.send(msg);

    // Log successful email delivery
    await storage.createEmailLog({
      subscriptionId: subscription.id,
      status: "sent",
      articleCount: articles.length,
      pdfPath,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // Delete orphaned PDF if it exists
    if (pdfPath) {
      try {
        const filename = pdfPath.split("/").pop();
        if (filename) {
          const filePath = join(
            process.cwd(),
            "server",
            "pdf_archives",
            filename,
          );
          await unlink(filePath);
          console.log(`Deleted orphaned PDF: ${filename}`);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up PDF:", cleanupError);
      }
    }

    // Log failed email delivery (without pdfPath since we deleted it)
    await storage.createEmailLog({
      subscriptionId: subscription.id,
      status: "failed",
      articleCount: articles.length,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
