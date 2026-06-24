import { Icons } from "@/components/icons";
import { House, Library } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Docker } from "@/components/ui/svgs/docker";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Javascript } from "@/components/ui/svgs/javascript";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";
import { Vite } from "@/components/ui/svgs/vite";
import { Pnpm } from "@/components/ui/svgs/pnpm";
import { Git } from "@/components/ui/svgs/git";
import { Linux } from "@/components/ui/svgs/linux";
import type { ReactNode } from "react";

type Photo = {
  src: string;
  alt: string;
};

type Work = {
  company: string;
  href: string;
  badges: string[];
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end?: string;
  description: string;
};

type Education = {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
};

type Project = {
  title: string;
  href: string;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  links: Array<{
    type: string;
    href: string;
    icon: ReactNode;
  }>;
  image: string;
  video: string;
};

type Hackathon = {
  title: string;
  dates: string;
  location: string;
  description: string;
  image: string;
  win?: string;
  mlh?: string;
  links: Array<{
    title: string;
    icon: ReactNode;
    href: string;
  }>;
};

export const DATA = {
  name: "emmm",
  initials: "E",
  url: "https://zzemy.top",
  location: "NJUPT",
  locationLink: "https://www.google.com/maps/search/NJUPT",
  description:
    "Full-stack developer focused on TypeScript, Node.js, and modern web applications.",
  summary:
    "I'm a full-stack developer building with **TypeScript** and **Node.js**, with a strong interest in the **Next.js** ecosystem. I write at [blog.zzemy.top](https://blog.zzemy.top), care about system performance, and keep exploring practical ways to contribute to open source.",
  avatarUrl: "/profile.jpg",
  ogImage: "/og_image.png",
  sections: {
    about: { order: 1, enabled: true, heading: "About" },
    work: { order: 2, enabled: false, heading: "Work Experience", presentLabel: "Present" },
    education: { order: 3, enabled: false, heading: "Education" },
    skills: { order: 4, enabled: true, heading: "Skills" },
    github: { order: 5, enabled: true, heading: "GitHub Snapshot" },
    projects: {
      order: 6,
      enabled: false,
      label: "Projects",
      heading: "Selected Work",
      text: "Projects will be added here as they are curated from public repositories.",
    },
    hackathons: {
      order: 7,
      enabled: false,
      label: "Hackathons",
      heading: "Hackathons",
      text: "No public hackathon information is currently listed.",
    },
    photos: {
      order: 6,
      enabled: false,
      heading: "Photos",
    },
    contact: {
      order: 8,
      enabled: true,
      label: "Contact",
      heading: "Find Me Online",
      text: "The fastest way to know what I'm working on is through GitHub and my blog.",
    },
  },
  photos: [] as Photo[],
  skills: [
    { name: "TypeScript", icon: Typescript },
    { name: "Node.js", icon: Nodejs },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "React", icon: ReactLight },
    { name: "JavaScript", icon: Javascript },
    { name: "Tailwind CSS", icon: Tailwindcss },
    { name: "Vite", icon: Vite },
    { name: "pnpm", icon: Pnpm },
    { name: "Docker", icon: Docker },
    { name: "Postgres", icon: Postgresql },
    { name: "Git", icon: Git },
    { name: "Linux", icon: Linux },
  ],
  githubSnapshot: [
    { label: "Public repos", value: "16", detail: "Open repositories" },
    { label: "Contributions", value: "1,034", detail: "Commits + authored PRs" },
    { label: "Pull requests", value: "47", detail: "Public authored PRs" },
    { label: "Since", value: "2021", detail: "Joined GitHub" },
  ],
  githubLanguages: [
    { name: "TypeScript", bytes: 51263828 },
    { name: "CSS", bytes: 153569 },
    { name: "JavaScript", bytes: 137249 },
    { name: "HTML", bytes: 64655 },
    { name: "C#", bytes: 44162 },
    { name: "PLpgSQL", bytes: 33884 },
  ],
  navbar: [
    { href: "/", icon: House, label: "Home" },
    { href: "https://blog.zzemy.top", icon: Library, label: "Blog" },
  ],
  contact: {
    email: "1992107794@qq.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/zzemy",
        icon: Icons.github,
        navbar: true,
      },
      Blog: {
        name: "Blog",
        url: "https://blog.zzemy.top",
        icon: Icons.globe,
        navbar: false,
      },
      Website: {
        name: "Website",
        url: "https://zzemy.top",
        icon: Icons.globe,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:1992107794@qq.com",
        icon: Icons.email,
        navbar: true,
      },
    },
  },
  work: [] as Work[],
  education: [] as Education[],
  projects: [] as Project[],
  hackathons: [] as Hackathon[],
} as const;
