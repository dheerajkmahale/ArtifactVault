import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Scan, Database, Shield, Users, Globe, Award, Zap, CheckCircle, Star, Lock, ArrowRight, MapPin } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // If user is not authenticated, redirect to index page
      // Otherwise, they can access the about page
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ArtifactVault</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
              <a href="/about" className="text-primary font-medium">About</a>
              <a href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-foreground">Revolutionizing</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Cultural Preservation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            ArtifactVault provides advanced 3D digitization technology for cultural institutions,
            enabling the preservation and sharing of historical artifacts through innovative AI-powered tools.
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Our Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To democratize access to global cultural heritage by providing institutions worldwide
              with enterprise-grade 3D digitization technology, enabling the preservation and
              sharing of humanity's most precious artifacts for future generations.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold">Our Values</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cultural sensitivity and respect</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Innovation in preservation technology</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Accessibility and inclusivity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Security and data protection</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Technology & Innovation */}
        <Card className="p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Technology & Innovation</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge computer vision, machine learning, and
              cloud infrastructure to deliver unprecedented accuracy and scalability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scan className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Advanced 3D Reconstruction</h4>
              <p className="text-muted-foreground text-sm">
                Proprietary computer vision algorithms achieve sub-millimeter precision
                in 3D model generation from 2D imagery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered Classification</h4>
              <p className="text-muted-foreground text-sm">
                Machine learning models trained on millions of artifacts provide
                automated categorization with 95%+ accuracy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Enterprise Security</h4>
              <p className="text-muted-foreground text-sm">
                Bank-level encryption, SOC 2 compliance, and role-based access
                control protect your valuable cultural assets.
              </p>
            </div>
          </div>
        </Card>

        {/* Leadership Team */}
        <Card className="p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Leadership Team</h3>
            <p className="text-muted-foreground">
              Experts in cultural heritage, technology, and business leadership
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-lg font-semibold">Dr. Sarah Chen</h4>
              <p className="text-sm text-muted-foreground mb-2">Chief Executive Officer</p>
              <p className="text-xs text-muted-foreground">
                Former Director of Digital Initiatives at the Metropolitan Museum
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Database className="h-10 w-10 text-secondary" />
              </div>
              <h4 className="text-lg font-semibold">Dr. Marcus Rodriguez</h4>
              <p className="text-sm text-muted-foreground mb-2">Chief Technology Officer</p>
              <p className="text-xs text-muted-foreground">
                AI researcher with 15+ years in computer vision and heritage preservation
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10 text-purple-500" />
              </div>
              <h4 className="text-lg font-semibold">Elena Vasquez</h4>
              <p className="text-sm text-muted-foreground mb-2">Chief Security Officer</p>
              <p className="text-xs text-muted-foreground">
                Former cybersecurity expert at UNESCO, specializing in cultural data protection
              </p>
            </div>
          </div>
        </Card>

        {/* Global Presence */}
        <Card className="p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Global Presence</h3>
            <p className="text-muted-foreground">
              Serving cultural institutions across six continents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold">Headquarters:</span>
                <span className="text-muted-foreground">San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-secondary" />
                <span className="font-semibold">Regional Offices:</span>
                <span className="text-muted-foreground">London, Tokyo, São Paulo</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Team Members:</span>
                <span className="text-muted-foreground">150+ across 12 countries</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground mb-4">Customer Satisfaction Rate</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SOC 2 Type II Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">ISO 27001 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">GDPR & CCPA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Partnership & Recognition */}
        <Card className="p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Partnerships & Recognition</h3>
            <p className="text-muted-foreground">
              Trusted by leading organizations and recognized by industry experts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Strategic Partners</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• UNESCO World Heritage Center</li>
                <li>• International Council of Museums (ICOM)</li>
                <li>• Getty Conservation Institute</li>
                <li>• Smithsonian Institution</li>
                <li>• British Museum</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Awards & Recognition</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• "Best Heritage Technology" - TechCrunch Disrupt 2023</li>
                <li>• "Innovation Award" - Museum Computer Network 2023</li>
                <li>• "Digital Preservation Leader" - Cultural Heritage Summit 2022</li>
                <li>• "Top 50 EdTech Companies" - EdTech Magazine 2022</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-border/50 text-center p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Institution?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the global community of cultural institutions leveraging
            cutting-edge technology to preserve and share our shared heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              Start Enterprise Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
            >
              Schedule Consultation
            </Button>
          </div>
        </Card>
      </div>


    </div>
  );
};

export default About;