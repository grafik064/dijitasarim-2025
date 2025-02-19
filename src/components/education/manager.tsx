function calculateRemainingTime(path: LearningPath) {
  const totalResources = path.topics.reduce(
    (acc, topic) => acc + topic.resources.length,
    0
  );
  const completedResources = path.topics.reduce(
    (acc, topic) =>
      acc + topic.resources.filter(r => r.completed).length,
    0
  );
  const remainingResources = totalResources - completedResources;

  // Ortalama kaynak süresi hesaplama (dakika cinsinden)
  const averageResourceDuration = path.topics.reduce(
    (acc, topic) =>
      acc +
      topic.resources.reduce((sum, resource) => {
        const duration = resource.duration.toLowerCase();
        if (duration.includes('saat')) {
          return sum + parseInt(duration) * 60;
        }
        if (duration.includes('dakika')) {
          return sum + parseInt(duration);
        }
        return sum;
      }, 0),
    0
  ) / totalResources;

  const remainingMinutes = remainingResources * averageResourceDuration;
  
  if (remainingMinutes < 60) {
    return `${Math.round(remainingMinutes)} dakika`;
  }
  
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = Math.round(remainingMinutes % 60);
  
  if (minutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${minutes} dakika`;
}

export interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  totalResources: number;
  completedResources: number;
  totalTime: number;
  remainingTime: number;
  lastActivity?: Date;
  nextMilestone?: {
    title: string;
    remainingItems: number;
  };
}

export function calculateProgressStats(path: LearningPath): ProgressStats {
  const totalTopics = path.topics.length;
  const completedTopics = path.topics.filter(t => t.completed).length;
  
  const totalResources = path.topics.reduce(
    (acc, topic) => acc + topic.resources.length,
    0
  );
  const completedResources = path.topics.reduce(
    (acc, topic) =>
      acc + topic.resources.filter(r => r.completed).length,
    0
  );

  // Toplam süreyi hesapla
  const totalTime = path.topics.reduce(
    (acc, topic) =>
      acc +
      topic.resources.reduce((sum, resource) => {
        const duration = resource.duration.toLowerCase();
        if (duration.includes('saat')) {
          return sum + parseInt(duration) * 60;
        }
        if (duration.includes('dakika')) {
          return sum + parseInt(duration);
        }
        return sum;
      }, 0),
    0
  );

  // Kalan süreyi hesapla
  const remainingTime = (totalResources - completedResources) * 
    (totalTime / totalResources);

  // Bir sonraki kilometre taşını bul
  const nextMilestone = (() => {
    const progressPercentage = (completedResources / totalResources) * 100;
    const milestones = [25, 50, 75, 100];
    const nextTarget = milestones.find(m => m > progressPercentage);
    
    if (nextTarget) {
      const remainingForMilestone = Math.ceil(
        (nextTarget / 100) * totalResources - completedResources
      );
      return {
        title: `${nextTarget}% Tamamlama`,
        remainingItems: remainingForMilestone
      };
    }
    return undefined;
  })();

  return {
    totalTopics,
    completedTopics,
    totalResources,
    completedResources,
    totalTime,
    remainingTime,
    nextMilestone
  };
}

export interface LearningActivity {
  id: string;
  type: 'resource_completed' | 'topic_completed' | 'path_started' | 'certificate_earned';
  timestamp: Date;
  details: {
    pathId: string;
    pathTitle: string;
    topicId?: string;
    topicTitle?: string;
    resourceId?: string;
    resourceTitle?: string;
  };
}

export function LearningActivityFeed({ activities }: { activities: LearningActivity[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          {getActivityIcon(activity.type)}
          <div>
            <p className="font-medium">
              {getActivityTitle(activity)}
            </p>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getActivityIcon(type: LearningActivity['type']) {
  const icons = {
    resource_completed: CheckCircle2,
    topic_completed: Star,
    path_started: Play,
    certificate_earned: Trophy
  };
  const Icon = icons[type];
  return (
    <div className="p-2 bg-white rounded-full">
      <Icon className="w-5 h-5 text-primary" />
    </div>
  );
}

function getActivityTitle(activity: LearningActivity): string {
  switch (activity.type) {
    case 'resource_completed':
      return `"${activity.details.resourceTitle}" kaynağını tamamladınız`;
    case 'topic_completed':
      return `"${activity.details.topicTitle}" konusunu tamamladınız`;
    case 'path_started':
      return `"${activity.details.pathTitle}" eğitim yoluna başladınız`;
    case 'certificate_earned':
      return `"${activity.details.pathTitle}" sertifikasını kazandınız`;
    default:
      return '';
  }
}

function formatTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes} dakika önce`;
  }
  if (hours < 24) {
    return `${hours} saat önce`;
  }
  return `${days} gün önce`;
}

export const EducationManagerContext = React.createContext<{
  activePath?: LearningPath;
  setActivePath: (path: LearningPath) => void;
  completeResource: (resourceId: string) => void;
  startResource: (resource: LearningPath['topics'][0]['resources'][0]) => void;
  requestCertificate: (pathId: string) => void;
} | null>(null);

export function useEducationManager() {
  const context = React.useContext(EducationManagerContext);
  if (!context) {
    throw new Error('useEducationManager must be used within an EducationManagerProvider');
  }
  return context;
}

export { EducationManager };