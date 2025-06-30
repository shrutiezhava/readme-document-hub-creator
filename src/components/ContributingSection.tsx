
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitPullRequest, Bug, Lightbulb, Heart, Users, MessageSquare } from 'lucide-react';

const ContributingSection = () => {
  const contributionTypes = [
    {
      icon: <Bug className="w-5 h-5" />,
      title: "Bug Reports",
      description: "Found a bug? Help us fix it by reporting it with detailed steps.",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Feature Requests",
      description: "Have an idea for a new feature? We'd love to hear about it!",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    },
    {
      icon: <GitPullRequest className="w-5 h-5" />,
      title: "Code Contributions",
      description: "Submit pull requests to help improve the codebase.",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Documentation",
      description: "Help improve our documentation and guides.",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Contributing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          We welcome contributions from the community! Here's how you can help make this project better:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributionTypes.map((type, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className={`p-2 rounded-full ${type.color}`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{type.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Getting Started
          </h4>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>1. Fork the repository on GitHub</li>
            <li>2. Create a new branch for your feature or fix</li>
            <li>3. Make your changes and commit them with clear messages</li>
            <li>4. Push your branch and create a pull request</li>
            <li>5. Wait for review and address any feedback</li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <GitPullRequest className="w-4 h-4 mr-2" />
            Create Pull Request
          </Button>
          <Button variant="outline">
            <Bug className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributingSection;
