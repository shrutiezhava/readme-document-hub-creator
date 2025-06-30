
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReadmeSection from '@/components/ReadmeSection';
import InstallationGuide from '@/components/InstallationGuide';
import ContributingSection from '@/components/ContributingSection';
import { 
  Github, 
  Star, 
  Download, 
  FileText, 
  Calculator, 
  Shield, 
  Zap, 
  Globe,
  BookOpen,
  Code,
  Users
} from 'lucide-react';

const Index = () => {
  const payslipFeatures = [
    "Generate professional payslips instantly",
    "Customizable templates and branding",
    "Tax calculations and deductions",
    "PDF export and email delivery",
    "Employee data management",
    "Compliance with local tax laws",
    "Bulk payslip generation",
    "Secure data encryption"
  ];

  const documentPortalFeatures = [
    "Centralized document management",
    "Advanced search and filtering",
    "Version control and history",
    "Role-based access control",
    "Document templates library",
    "Collaboration tools and comments",
    "Automated workflows",
    "Integration with cloud storage"
  ];

  const techStack = [
    "React", "TypeScript", "Tailwind CSS", "Vite", "Node.js", "Express", "PostgreSQL", "JWT Auth"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Document Hub Creator
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Professional payslip generation and document management platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Open Source
              </Badge>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Github className="w-4 h-4 mr-2" />
                Connect to GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Project Overview */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold mb-4">
              🚀 Welcome to Document Hub Creator
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg max-w-3xl mx-auto">
              A comprehensive solution combining a powerful payslip generator with an advanced document portal. 
              Built with modern technologies for businesses that need reliable document management and payroll processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Production Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>High Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Global Ready</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Download className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Code className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Applications */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Featured Applications
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Two powerful applications designed to streamline your business operations
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReadmeSection
              title="Payslip Generator"
              description="Professional payslip generation with automated calculations, tax compliance, and customizable templates for businesses of all sizes."
              icon={<Calculator className="w-8 h-8" />}
              features={payslipFeatures}
              techStack={techStack}
              demoUrl="https://demo.payslip-generator.com"
              repoUrl="https://github.com/yourusername/payslip-generator"
            />
            
            <ReadmeSection
              title="Document Portal"
              description="Advanced document management system with collaboration tools, version control, and enterprise-grade security features."
              icon={<FileText className="w-8 h-8" />}
              features={documentPortalFeatures}
              techStack={techStack}
              demoUrl="https://demo.document-portal.com"
              repoUrl="https://github.com/yourusername/document-portal"
            />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Installation Guide */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quick Setup Guide
          </h2>
          <InstallationGuide />
        </div>

        <Separator className="my-8" />

        {/* Contributing Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Our Community
          </h2>
          <ContributingSection />
        </div>

        {/* Footer */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already using our document management solutions. 
              Connect to GitHub to start building with our platform today.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Github className="w-4 h-4 mr-2" />
                Connect to GitHub
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Docs
              </Button>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Built with ❤️ by the Document Hub Creator team • Licensed under MIT
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
