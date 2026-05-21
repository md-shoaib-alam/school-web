import { Metadata } from 'next';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'SchoolSaaS | All-in-One School Management Platform',
  description: 'The most powerful, intuitive, and modern platform to manage your school ecosystem. From attendance to exams, we have you covered.',
};

export default function Home() {
  return <HomeClient />;
}
