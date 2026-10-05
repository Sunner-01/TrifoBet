// components/profile/tabs/ActivityTab.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Target, TrendingUp, TrendingDown, Settings, Shield } from "lucide-react";

export function ActivityTab({ recentActivity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case "login": return <User className="h-4 w-4 text-blue-600" />;
      case "bet": return <Target className="h-4 w-4 text-green-600" />;
      case "deposit": return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "withdrawal": return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case "profile": return <Settings className="h-4 w-4 text-gray-600" />;
      case "security": return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="p-2 rounded-lg bg-gray-100">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(activity.time).toLocaleString()}</span>
                  {activity.ip && <span>IP: {activity.ip}</span>}
                  {activity.device && <span>{activity.device}</span>}
                </div>
              </div>
              <div className="text-right">
                {activity.amount && <div className="font-medium">{activity.amount}</div>}
                {activity.status && <Badge>{activity.status}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
