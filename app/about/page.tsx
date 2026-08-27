import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "소개 — FunIQ",
};

export default function AboutPage() {
  return <AboutContent />;
}
