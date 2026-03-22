import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Plus, 
  Camera, 
  MapPin
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-green-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Empowering Citizens,{' '}
                  <span className="text-blue-600">Improving Communities</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Report civic issues easily and track resolutions with your local authorities.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => onNavigate('report')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Report an Issue
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onNavigate('issues')}
                  className="px-8 py-3"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  View All Issues
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1658734029438-d97357737bf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjaXZpYyUyMGNpdHklMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzU4Njk1NDYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Community reporting civic issues"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Snap2Solve Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, fast, and effective civic issue reporting in three easy steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Click & Describe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Take a clear photo, describe the problem, and add the exact location. 
                  The more detail you provide, the faster authorities can act.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Track Your Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every complaint receives a unique token. Track the status of your 
                  report from submission to resolution in one place.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S2S</span>
                </div>
                <span className="text-xl font-semibold">snap2solve</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering citizens to improve their communities through collaborative 
                civic issue reporting and resolution.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => onNavigate('report')}>Report Issue</button></li>
                <li><button onClick={() => onNavigate('issues')}>All Issues</button></li>
                <li><button onClick={() => onNavigate('profile')}>Profile</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Contact</li>
                <li>FAQ</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2026 snap2solve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
