import React from 'react';
import SearchClient from '../search/SearchClient';

export const metadata = {
  title: 'Search',
  description: 'Search for jobs, news, and documents',
};

export default function SearchPage() {
  return <SearchClient />;
}