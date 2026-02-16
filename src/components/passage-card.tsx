import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAM_TYPE_LABELS: Record<string, string> = {
  MOCK_6: "6모",
  MOCK_9: "9모",
  CSAT: "수능",
};

const CATEGORY_LABELS: Record<string, string> = {
  THEORY: "독서론",
  SOCIETY: "사회",
  SCIENCE: "과학",
  HUMAN: "인문",
  TECH: "기술",
  ART: "예술",
  GRAMMAR: "문법",
};

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

type PassageCardProps = {
  passage: {
    id: number;
    year: number;
    examType: string;
    number: number;
    category: string;
    subject: string;
    content: string | null;
  };
};

export function PassageCard({ passage }: PassageCardProps) {
  const rawContent = passage.content
    ? decodeHtmlEntities(passage.content)
    : null;
  const preview = rawContent
    ? rawContent.length > 150
      ? `${rawContent.slice(0, 150)}...`
      : rawContent
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{passage.year}</Badge>
          <Badge variant="outline">
            {EXAM_TYPE_LABELS[passage.examType] ?? passage.examType}
          </Badge>
          <Badge variant="secondary">
            {CATEGORY_LABELS[passage.category] ?? passage.category}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          <Link href={`/passages/${passage.id}`} className="hover:underline">
            {passage.subject}
          </Link>
        </CardTitle>
      </CardHeader>
      {preview && (
        <CardContent>
          <CardDescription className="line-clamp-3 leading-relaxed">
            {preview}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
}
