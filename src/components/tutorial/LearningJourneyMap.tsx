import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, PuzzlePiece, StackSimple, Books, Users, 
  CheckCircle, Circle, Star, TrendUp, Target, 
  Path, MapPin, Trophy, Sparkle, GraduationCap
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface LearningNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  skills: string[];
  completionRate: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  path: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  nodes: LearningNode[];
  totalProgress: number;
  recommendedOrder: string[];
}

interface LearningJourneyMapProps {
  currentPage?: string;
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const learningPaths: LearningPath[] = [
  {
    id: 'beginner-path',
    title: 'Beginner\'s Journey',
    description: 'Start your AI agent learning adventure',
    recommendedOrder: ['core-concepts', 'azure-services', 'references', 'community', 'agent-patterns', 'quiz'],
    totalProgress: 0,
    nodes: [
      {
        id: 'core-concepts',
        title: 'Core Concepts',
        description: 'Fundamental AI agent concepts',
        icon: <Brain size={20} />,
        difficulty: 'beginner',
        estimatedTime: '25-30 min',
        prerequisites: [],
        skills: ['Agent Lifecycle', 'Communication Patterns', 'Protocol Basics'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: true,
        path: '/'
      },
      {
        id: 'azure-services',
        title: 'Azure Services',
        description: 'Cloud AI service integration',
        icon: <StackSimple size={20} />,
        difficulty: 'intermediate',
        estimatedTime: '20-25 min',
        prerequisites: ['core-concepts'],
        skills: ['Service Integration', 'API Usage', 'Cloud Architecture'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: false,
        path: '/azure-services'
      },
      {
        id: 'references',
        title: 'References',
        description: 'Essential documentation and resources',
        icon: <Books size={20} />,
        difficulty: 'beginner',
        estimatedTime: '15-20 min',
        prerequisites: [],
        skills: ['Documentation Navigation', 'Resource Discovery'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: true,
        path: '/references'
      },
      {
        id: 'community',
        title: 'Community',
        description: 'Connect and share with others',
        icon: <Users size={20} />,
        difficulty: 'beginner',
        estimatedTime: '10-15 min',
        prerequisites: [],
        skills: ['Community Engagement', 'Knowledge Sharing'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: true,
        path: '/community'
      },
      {
        id: 'agent-patterns',
        title: 'Agent Patterns',
        description: 'Implementation patterns and best practices',
        icon: <PuzzlePiece size={20} />,
        difficulty: 'advanced',
        estimatedTime: '35-40 min',
        prerequisites: ['core-concepts', 'azure-services'],
        skills: ['Pattern Implementation', 'Best Practices', 'Code Examples'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: false,
        path: '/patterns'
      },
      {
        id: 'quiz',
        title: 'Knowledge Quiz',
        description: 'Test your understanding with adaptive quizzes',
        icon: <GraduationCap size={20} />,
        difficulty: 'beginner',
        estimatedTime: '15-20 min',
        prerequisites: [],
        skills: ['Knowledge Assessment', 'Concept Validation', 'Progress Tracking'],
        completionRate: 0,
        isCompleted: false,
        isUnlocked: true,
        path: '/quiz'
      }
    ]
  }
];

export const LearningJourneyMap: React.FC<LearningJourneyMapProps> = ({
  currentPage = 'core-concepts',
  isVisible,
  onClose,
  onNavigate
}) => {
  const [selectedPath, setSelectedPath] = useState<LearningPath>(learningPaths[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Debounced hover handlers to prevent flickering
  const handleMouseEnter = useCallback((nodeId: string) => {
    setHoveredNode(nodeId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Load user progress from localStorage
  useEffect(() => {
    const updatedPath = { ...selectedPath };
    let totalCompleted = 0;
    
    updatedPath.nodes = updatedPath.nodes.map(node => {
      // Handle quiz node separately
      if (node.id === 'quiz') {
        const quizProgress = localStorage.getItem('quiz-progress');
        if (quizProgress) {
          const progress = JSON.parse(quizProgress);
          const completedQuizzes = progress.completedQuizzes || [];
          const totalQuizzes = progress.totalQuizzes || 0;
          const averageScore = progress.averageScore || 0;
          
          // Consider quiz completed if they've taken at least 3 quizzes with 70%+ average
          const isCompleted = completedQuizzes.length >= 3 && averageScore >= 70;
          const completionRate = Math.min(100, (completedQuizzes.length / Math.max(1, totalQuizzes)) * 100);
          
          if (isCompleted) totalCompleted++;
          
          return {
            ...node,
            completionRate,
            isCompleted,
            isUnlocked: true // Quiz is always unlocked
          };
        }
        return node;
      }
      
      // Handle other nodes with existing logic
      const analytics = localStorage.getItem(`page-analytics-${node.id}`);
      if (analytics) {
        const data = JSON.parse(analytics);
        const completionRate = data.completionRate || 0;
        const isCompleted = completionRate >= 80;
        
        if (isCompleted) totalCompleted++;
        
        return {
          ...node,
          completionRate,
          isCompleted,
          isUnlocked: node.prerequisites.length === 0 || 
                     node.prerequisites.every(prereq => 
                       updatedPath.nodes.find(n => n.id === prereq)?.isCompleted
                     )
        };
      }
      return node;
    });
    
    updatedPath.totalProgress = (totalCompleted / updatedPath.nodes.length) * 100;
    setSelectedPath(updatedPath);
  }, [isVisible]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNodePosition = (index: number, total: number) => {
    // Create a more spread out layout that uses the full canvas width
    const containerWidth = 800;
    const containerHeight = 400;
    const nodeRadius = 32; // Node radius for positioning
    const padding = 80; // More padding from edges
    
    if (total <= 1) {
      return { x: containerWidth / 2, y: containerHeight / 2 };
    }
    
    // Use a flowing path that spreads horizontally across the canvas
    const progress = index / (total - 1); // 0 to 1
    const x = padding + progress * (containerWidth - padding * 2);
    
    // Create a more pronounced wave pattern for better spacing
    const waveHeight = containerHeight * 0.3; // Increased wave height
    const centerY = containerHeight / 2;
    // Use a more complex wave pattern to avoid nodes clustering
    const waveOffset = Math.sin(progress * Math.PI * 1.5) * waveHeight;
    const y = Math.max(nodeRadius + 20, Math.min(containerHeight - nodeRadius - 20, centerY + waveOffset));
    
    return { x, y };
  };

  const getNextRecommendedNode = () => {
    const uncompletedNodes = selectedPath.nodes.filter(node => !node.isCompleted && node.isUnlocked);
    if (uncompletedNodes.length === 0) return null;
    
    // Find the next node in the recommended order
    for (const nodeId of selectedPath.recommendedOrder) {
      const node = uncompletedNodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    
    return uncompletedNodes[0];
  };

  const getAchievements = () => {
    const completedNodes = selectedPath.nodes.filter(node => node.isCompleted);
    const achievements = [];
    
    if (completedNodes.length >= 1) {
      achievements.push({ title: 'First Steps', description: 'Completed your first section', icon: <Star size={16} /> });
    }
    if (completedNodes.length >= 3) {
      achievements.push({ title: 'Learning Streak', description: 'Completed 3 sections', icon: <TrendUp size={16} /> });
    }
    if (completedNodes.length === selectedPath.nodes.length) {
      achievements.push({ title: 'Journey Complete', description: 'Mastered all sections', icon: <Trophy size={16} /> });
    }
    
    // Quiz-specific achievements
    const quizProgress = localStorage.getItem('quiz-progress');
    if (quizProgress) {
      const progress = JSON.parse(quizProgress);
      const completedQuizzes = progress.completedQuizzes || [];
      const highScores = completedQuizzes.filter((quiz: any) => quiz.score >= 90);
      const perfectScores = completedQuizzes.filter((quiz: any) => quiz.score === 100);
      
      if (completedQuizzes.length >= 1) {
        achievements.push({ title: 'Quiz Taker', description: 'Completed your first quiz', icon: <GraduationCap size={16} /> });
      }
      if (highScores.length >= 3) {
        achievements.push({ title: 'High Achiever', description: 'Scored 90%+ on 3 quizzes', icon: <Target size={16} /> });
      }
      if (perfectScores.length >= 1) {
        achievements.push({ title: 'Perfect Score', description: 'Achieved 100% on a quiz', icon: <Sparkle size={16} /> });
      }
    }
    
    return achievements;
  };

  if (!isVisible) return null;

  const nextNode = getNextRecommendedNode();
  const achievements = getAchievements();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Path size={20} className="text-primary" />
                Learning Journey Map
              </CardTitle>
              <CardDescription>
                Visualize your progress and discover your next steps
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Progress:</span>
              <Progress value={selectedPath.totalProgress} className="w-32" />
              <span className="text-sm text-muted-foreground">
                {Math.round(selectedPath.totalProgress)}%
              </span>
            </div>
            
            {achievements.length > 0 && (
              <div className="flex items-center gap-1">
                <Trophy size={16} className="text-yellow-600" />
                <span className="text-sm font-medium">{achievements.length} achievements</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Learning Path Visualization */}
          <div className="relative bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg p-6 min-h-[500px]">
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              {/* Draw connections between nodes */}
              {selectedPath.nodes.map((node, index) => {
                if (index === selectedPath.nodes.length - 1) return null;
                
                const current = getNodePosition(index, selectedPath.nodes.length);
                const next = getNodePosition(index + 1, selectedPath.nodes.length);
                
                return (
                  <line
                    key={`connection-${index}`}
                    x1={current.x}
                    y1={current.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={node.isCompleted ? '#22c55e' : '#cbd5e1'}
                    strokeWidth="1.5"
                    strokeDasharray={node.isCompleted ? '0' : '4,4'}
                    className="transition-all duration-300"
                    opacity={0.7}
                  />
                );
              })}
            </svg>
            
            {/* Learning Nodes */}
            {selectedPath.nodes.map((node, index) => {
              const position = getNodePosition(index, selectedPath.nodes.length);
              const isCurrentPage = currentPage === node.id;
              const isHovered = hoveredNode === node.id;
              
              return (
                <div
                  key={node.id}
                  className={cn(
                    "absolute w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200",
                    // Remove CSS hover to prevent conflicts
                    node.isCompleted ? "bg-green-500 border-green-600 text-white" :
                    node.isUnlocked ? "bg-primary border-primary text-white" :
                    "bg-muted border-muted-foreground text-muted-foreground",
                    isCurrentPage && "ring-4 ring-primary/30",
                    // Only apply hover effects via JavaScript state
                    isHovered && "scale-110 shadow-lg z-20"
                  )}
                  style={{
                    left: position.x - 32,
                    top: position.y - 32,
                    zIndex: isHovered ? 20 : 10
                  }}
                  onClick={() => {
                    if (node.isUnlocked) {
                      onNavigate(node.path);
                    }
                  }}
                  onMouseEnter={() => handleMouseEnter(node.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {node.isCompleted ? (
                    <CheckCircle size={24} weight="fill" />
                  ) : (
                    node.icon
                  )}
                  
                  {/* Node label */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                    <div className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isCurrentPage ? "text-primary" : "text-foreground"
                    )}>
                      {node.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {node.estimatedTime}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Recommendations and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Next Steps */}
            {nextNode && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Recommended Next Step
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        {nextNode.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{nextNode.title}</h4>
                        <p className="text-sm text-muted-foreground">{nextNode.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-xs", getDifficultyColor(nextNode.difficulty))}>
                        {nextNode.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {nextNode.estimatedTime}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => onNavigate(nextNode.path)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkle size={16} className="text-yellow-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <div className="text-yellow-600">
                          {achievement.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{achievement.title}</div>
                          <div className="text-xs text-muted-foreground">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Detailed Node Information - Fixed position to prevent layout shifts */}
          {hoveredNode && (
            <div className="mt-4">
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  {(() => {
                    const node = selectedPath.nodes.find(n => n.id === hoveredNode);
                    if (!node) return null;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-primary/10 rounded">
                            {node.icon}
                          </div>
                          <h4 className="font-medium">{node.title}</h4>
                          <Badge className={cn("text-xs", getDifficultyColor(node.difficulty))}>
                            {node.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{node.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span>⏱️ {node.estimatedTime}</span>
                          <span>✅ {node.completionRate}% complete</span>
                          {node.id === 'quiz' && (() => {
                            const quizProgress = localStorage.getItem('quiz-progress');
                            if (quizProgress) {
                              const progress = JSON.parse(quizProgress);
                              const averageScore = progress.averageScore || 0;
                              const completedQuizzes = progress.completedQuizzes || [];
                              return (
                                <>
                                  <span>📊 {averageScore}% avg score</span>
                                  <span>🎯 {completedQuizzes.length} quizzes taken</span>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {node.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Placeholder to maintain consistent height when no node is hovered */}
          {!hoveredNode && (
            <div className="mt-4">
              <Card className="border-transparent">
                <CardContent className="p-4">
                  <div className="space-y-2 opacity-0">
                    <div className="h-6 bg-transparent"></div>
                    <div className="h-4 bg-transparent"></div>
                    <div className="h-4 bg-transparent"></div>
                    <div className="h-6 bg-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningJourneyMap;
