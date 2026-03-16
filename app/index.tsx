import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "./_layout";

export default function RootIndex() {
  const { session, initialLoading } = useAuth();

  if (initialLoading) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
