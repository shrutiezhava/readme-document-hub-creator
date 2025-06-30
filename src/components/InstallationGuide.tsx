
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, Download } from 'lucide-react';
import { toast } from 'sonner';

const InstallationGuide = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const codeBlocks = {
    clone: 'git clone https://github.com/yourusername/payslip-document-hub.git\ncd payslip-document-hub',
    install: 'npm install\n# or\nyarn install\n# or\npnpm install',
    run: 'npm run dev\n# or\nyarn dev\n# or\npnpm dev',
    build: 'npm run build\n# or\nyarn build\n# or\npnpm build'
  };

  const CodeBlock = ({ code, title }: { code: string; title: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyToClipboard(code)}
          className="h-6 px-2"
        >
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Installation & Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Start</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="space-y-4">
            <div className="space-y-4">
              <CodeBlock code={codeBlocks.clone} title="1. Clone the repository" />
              <CodeBlock code={codeBlocks.install} title="2. Install dependencies" />
              <CodeBlock code={codeBlocks.run} title="3. Start development server" />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🚀 Your app will be running at <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://localhost:8080</code>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Prerequisites</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Node.js 18+ and npm/yarn/pnpm</li>
                  <li>• Git for version control</li>
                  <li>• Modern web browser</li>
                </ul>
              </div>
              
              <CodeBlock code={codeBlocks.clone} title="1. Clone and navigate" />
              <CodeBlock code={codeBlocks.install} title="2. Install dependencies" />
              <CodeBlock code={codeBlocks.run} title="3. Start development" />
              <CodeBlock code={codeBlocks.build} title="4. Build for production" />
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Environment Setup</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Create a <code>.env.local</code> file in the root directory and add your configuration variables.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InstallationGuide;
