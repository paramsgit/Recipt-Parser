# Receipt Parser

## What did you build?

I built a small full-stack receipt parser application using Next.js and TypeScript. The app allows a user to upload a receipt image, sends the image to a vision-capable LLM for extraction, and returns structured receipt data including merchant name, date, line items, subtotal, tax, discount, and total. The extracted data is shown in an editable UI where users can review and correct fields before saving. I also added confidence indicators for extracted fields to make the correction flow more usable.

Live url: https://recipt-parser.vercel.app/

---

## What are the biggest tradeoffs you made, and why?

One tradeoff I made was prioritizing the correction experience over building a highly complex OCR pipeline. Since the assignment emphasized that the product works because humans correct LLM mistakes, I spent more time building editable structured fields and confidence handling instead of trying to maximize extraction accuracy through multiple OCR stages.

Another tradeoff was keeping the backend architecture lightweight while still making it extensible. I used a simple provider abstraction with a small factory pattern so switching from Gemini to another model like OpenAI would require minimal code changes, without introducing unnecessary architectural complexity for a small project.

I also separated purchasable line items from accounting fields like subtotal, tax, and discount. Mixing them together made correction logic more ambiguous, so I chose a cleaner structure even though receipts can vary significantly in formatting.

---

## Where did you use an LLM, and for what?

 I used Claude and ChatGPT mainly for prompt iteration, response-shape refinement, and thinking through edge cases around malformed receipt data. I used GitHub Copilot selectively for repetitive setup work like database scaffolding and small utility functions. The overall architecture, API flow, correction UX decisions, provider abstraction, and application structure were planned and implemented by me.

## What would you do with another week?

The first thing I would improve is extraction reliability. I would add a preprocessing pipeline for image enhancement, retries with fallback prompts, and better handling for low-quality or rotated receipts.

I would also improve the correction UX further by highlighting low-confidence fields directly in the UI, showing extracted receipt regions beside fields, and adding keyboard-friendly editing for faster corrections.

On the backend side, I would move persistence to a production-ready database setup and add receipt versioning/history so corrected data changes could be tracked over time.

Finally, I would add proper evaluation tooling with a small labeled dataset to measure extraction accuracy and compare prompt/model changes more systematically.

---

## What's one thing in this spec you'd push back on if I were your PM?

I would push back slightly on treating all receipts as a single structured format. Real receipts vary heavily across countries, vendors, languages, taxes, discounts, and formatting styles, so defining a universal schema without clarifying business requirements can create misleading assumptions about extraction accuracy.

Before expanding the product further, I would want clearer requirements around what counts as a “line item,” how accounting-related fields should be normalized, and what level of accuracy is considered acceptable for production use.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
