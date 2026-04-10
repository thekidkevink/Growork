import React from "react";

import BusinessRequestsQueueScreen from "@/components/admin/BusinessRequestsQueueScreen";

export default function RejectedRequestsScreen() {
  return <BusinessRequestsQueueScreen status="rejected" />;
}
