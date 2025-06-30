
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Star, Download, Users, FileText, Calculator } from 'lucide-react';

interface ReadmeSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  techStack: string[];
  demoUrl?: string;
  repoUrl?: string;
}

const ReadmeSection = ({ title, description, icon, features, techStack, demoUrl, repoUrl }: ReadmeSectionProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white w-fit">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-gray-600 dark:text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">✨ Key Features</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">🛠️ Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          {demoUrl && (
            <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Star className="w-4 h-4 mr-2" />
              Live Demo
            </Button>
          )}
          {repoUrl && (
            <Button size="sm" variant="outline" className="flex-1">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadmeSection;
