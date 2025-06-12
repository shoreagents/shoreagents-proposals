import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Star, Trophy, Brain, Code, Globe, Zap, Target, DollarSign, Clock, CheckCircle, Book, Monitor, Smartphone } from 'lucide-react';

const LeoDevGuide = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [completedItems, setCompletedItems] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCompletion = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      purple: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
      pink: 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800',
      emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
      orange: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
      green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    };
    return colorMap[color] || colorMap.blue;
  };

  const SectionHeader = ({ title, icon: Icon, isExpanded, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 text-white rounded-lg transition-all duration-300 ${getColorClasses(color)}`}
    >
      <div className="flex items-center">
        <Icon className="w-6 h-6 mr-3" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );

  const ChecklistItem = ({ id, title, description, difficulty, timeToLearn }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <button
        onClick={() => toggleCompletion(id)}
        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          completedItems[id] 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {completedItems[id] && <CheckCircle className="w-3 h-3" />}
      </button>
      <div className="flex-1">
        <h4 className={`font-semibold ${completedItems[id] ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className={`text-xs px-2 py-1 rounded ${
            difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {difficulty}
          </span>
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeToLearn}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-6">
            <h1 className="text-4xl font-bold mb-4">🚀 Leo's Career Transformation Guide</h1>
            <p className="text-xl text-blue-100">From Sales Admin to AI-Powered Digital Marketing Specialist</p>
            <div className="flex justify-center items-center mt-4 space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">₱40,000</div>
                <div className="text-sm">Current Salary</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">₱47,000</div>
                <div className="text-sm">Enhanced Salary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Increase Explanation */}
        <div className="mb-8">
          <SectionHeader
            title="Your Salary Increase Explained"
            icon={DollarSign}
            isExpanded={expandedSections.salary}
            onClick={() => toggleSection('salary')}
            color="green"
          />
          
          {expandedSections.salary && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">Immediate Increase: ₱3,000/month</h4>
                  <h5 className="font-semibold text-blue-700 mb-2">Why You Earned This:</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• 3 years of proven excellence with Michael</li>
                    <li>• Perfect client satisfaction (5/5 rating)</li>
                    <li>• Outstanding attendance and reliability</li>
                    <li>• Strong performance across all areas (4/5 overall)</li>
                    <li>• Proactive problem-solving during disruptions</li>
                    <li>• Exceptional responsiveness and efficiency</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">Month 3 Increase: ₱4,000/month</h4>
                  <h5 className="font-semibold text-green-700 mb-2">What You Need to Achieve:</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Master AI tools integration with REX</li>
                    <li>• Successfully create AI-enhanced reports</li>
                    <li>• Implement local SEO content strategy</li>
                    <li>• Demonstrate improved lead generation</li>
                    <li>• Show measurable client value increase</li>
                    <li>• Complete all training milestones</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h4 className="font-bold text-yellow-800 mb-2">🎯 Success Formula</h4>
                <p className="text-yellow-700">
                  Your role is evolving from <strong>task executor</strong> to <strong>strategic partner</strong>. 
                  The salary increase reflects this transformation and the enhanced value you'll deliver to Michael's business.
                  Master the tools below, and you'll not only earn the increase but position yourself for even greater opportunities!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Tools & Technologies */}
        <div className="mb-8">
          <SectionHeader
            title="AI Tools & Technologies to Master"
            icon={Brain}
            isExpanded={expandedSections.aitools}
            onClick={() => toggleSection('aitools')}
            color="purple"
          />
          
          {expandedSections.aitools && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <ChecklistItem
                  id="claude-ai"
                  title="Claude AI (Anthropic)"
                  description="Master prompt engineering for content creation, data analysis, and strategic planning"
                  difficulty="Easy"
                  timeToLearn="1-2 weeks"
                />
                <ChecklistItem
                  id="cursor-editor"
                  title="Cursor AI Code Editor"
                  description="Learn AI-assisted coding for website development and automation scripts"
                  difficulty="Medium"
                  timeToLearn="3-4 weeks"
                />
                <ChecklistItem
                  id="sunu-ai"
                  title="SUNU AI (Music Generation)"
                  description="Create AI-generated property songs and audio content for social media"
                  difficulty="Easy"
                  timeToLearn="1 week"
                />
                <ChecklistItem
                  id="make-automation"
                  title="Make.com (Automation Platform)"
                  description="Build automated workflows connecting REX, social media, and email systems"
                  difficulty="Medium"
                  timeToLearn="2-3 weeks"
                />
                <ChecklistItem
                  id="rex-api"
                  title="REX API Integration"
                  description="Connect AI tools with REX system for automated data analysis and reporting"
                  difficulty="Hard"
                  timeToLearn="4-6 weeks"
                />
              </div>
            </div>
          )}
        </div>

        {/* Web Development Skills */}
        <div className="mb-8">
          <SectionHeader
            title="Web Development & SEO Skills"
            icon={Code}
            isExpanded={expandedSections.webdev}
            onClick={() => toggleSection('webdev')}
            color="indigo"
          />
          
          {expandedSections.webdev && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <ChecklistItem
                  id="html-css"
                  title="HTML & CSS Basics"
                  description="Foundation for website creation and modification with AI assistance"
                  difficulty="Easy"
                  timeToLearn="2-3 weeks"
                />
                <ChecklistItem
                  id="vercel-deployment"
                  title="Vercel Deployment Platform"
                  description="Learn to deploy and manage websites for Michael's agents"
                  difficulty="Medium"
                  timeToLearn="1-2 weeks"
                />
                <ChecklistItem
                  id="seo-fundamentals"
                  title="SEO Fundamentals"
                  description="Keyword research, content optimization, and local SEO strategies"
                  difficulty="Medium"
                  timeToLearn="3-4 weeks"
                />
                <ChecklistItem
                  id="google-tools"
                  title="Google SEO Tools"
                  description="Master Google My Business, Search Console, and Analytics"
                  difficulty="Easy"
                  timeToLearn="2 weeks"
                />
                <ChecklistItem
                  id="content-creation"
                  title="AI-Powered Content Creation"
                  description="Create local lifestyle content, property descriptions, and market reports"
                  difficulty="Easy"
                  timeToLearn="1-2 weeks"
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced REX Mastery */}
        <div className="mb-8">
          <SectionHeader
            title="Enhanced REX System Mastery"
            icon={Monitor}
            isExpanded={expandedSections.rex}
            onClick={() => toggleSection('rex')}
            color="blue"
          />
          
          {expandedSections.rex && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <ChecklistItem
                  id="rex-data-analysis"
                  title="Advanced REX Data Analysis"
                  description="Use AI to analyze REX patterns and identify sales opportunities"
                  difficulty="Medium"
                  timeToLearn="2-3 weeks"
                />
                <ChecklistItem
                  id="rex-automation"
                  title="REX Workflow Automation"
                  description="Create smart workflows triggered by REX activities and data changes"
                  difficulty="Medium"
                  timeToLearn="3-4 weeks"
                />
                <ChecklistItem
                  id="rex-reporting"
                  title="AI-Enhanced REX Reporting"
                  description="Generate intelligent market reports and client insights from REX data"
                  difficulty="Easy"
                  timeToLearn="1-2 weeks"
                />
                <ChecklistItem
                  id="rex-lead-scoring"
                  title="Predictive Lead Scoring"
                  description="Use AI to score and prioritize leads based on REX history and behavior"
                  difficulty="Hard"
                  timeToLearn="4-5 weeks"
                />
              </div>
            </div>
          )}
        </div>

        {/* Social Media & Marketing */}
        <div className="mb-8">
          <SectionHeader
            title="Digital Marketing & Social Media"
            icon={Smartphone}
            isExpanded={expandedSections.marketing}
            onClick={() => toggleSection('marketing')}
            color="pink"
          />
          
          {expandedSections.marketing && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <ChecklistItem
                  id="facebook-ads"
                  title="Facebook Ads Management"
                  description="Create and manage property marketing campaigns with AI-generated content"
                  difficulty="Medium"
                  timeToLearn="2-3 weeks"
                />
                <ChecklistItem
                  id="social-automation"
                  title="Social Media Automation"
                  description="Set up automated posting and engagement for property listings and market updates"
                  difficulty="Easy"
                  timeToLearn="1-2 weeks"
                />
                <ChecklistItem
                  id="content-calendar"
                  title="AI Content Calendar Management"
                  description="Plan and execute consistent local content strategy for Dapto market"
                  difficulty="Easy"
                  timeToLearn="1 week"
                />
                <ChecklistItem
                  id="video-scripts"
                  title="AI Video Script Generation"
                  description="Create compelling property tour and market update video scripts"
                  difficulty="Easy"
                  timeToLearn="1 week"
                />
              </div>
            </div>
          )}
        </div>

        {/* Learning Resources & Support */}
        <div className="mb-8">
          <SectionHeader
            title="Learning Resources & Support"
            icon={Book}
            isExpanded={expandedSections.resources}
            onClick={() => toggleSection('resources')}
            color="emerald"
          />
          
          {expandedSections.resources && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">🎓 Training Provided</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Weekly 1-on-1 coaching sessions</li>
                    <li>• Access to premium AI tool tutorials</li>
                    <li>• Step-by-step implementation guides</li>
                    <li>• Real-time support during learning</li>
                    <li>• Practice projects with feedback</li>
                    <li>• Peer learning with other enhanced VAs</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">💡 Success Tips</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Start with one tool at a time</li>
                    <li>• Practice daily for 30-60 minutes</li>
                    <li>• Document your learning progress</li>
                    <li>• Ask questions - no question is too small</li>
                    <li>• Apply new skills to real work immediately</li>
                    <li>• Celebrate small wins along the way</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">🤝 Your Support Team</h4>
                <p className="text-blue-700 text-sm">
                  You're not learning alone! You'll have dedicated trainers, technical support, 
                  and direct access to Stephen for guidance. We're invested in your success because 
                  your growth directly benefits our clients and strengthens ShoreAgents' reputation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline & Milestones */}
        <div className="mb-8">
          <SectionHeader
            title="Your 90-Day Learning Timeline"
            icon={Target}
            isExpanded={expandedSections.timeline}
            onClick={() => toggleSection('timeline')}
            color="orange"
          />
          
          {expandedSections.timeline && (
            <div className="mt-4 bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-bold text-blue-800">Month 1: Foundation (Weeks 1-4)</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Master Claude AI for content creation</li>
                    <li>• Learn basic SEO and Google tools</li>
                    <li>• Start REX data analysis training</li>
                    <li>• Begin first local content pieces</li>
                    <li>• <strong>Milestone:</strong> First AI-enhanced report delivered</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-bold text-purple-800">Month 2: Integration (Weeks 5-8)</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Implement Make.com automations</li>
                    <li>• Create first property songs with SUNU AI</li>
                    <li>• Launch social media automation</li>
                    <li>• Begin website development with Cursor</li>
                    <li>• <strong>Milestone:</strong> Full automation workflows active</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-bold text-green-800">Month 3: Optimization (Weeks 9-12)</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Deploy advanced REX integrations</li>
                    <li>• Launch local SEO content strategy</li>
                    <li>• Implement predictive analytics</li>
                    <li>• Measure and optimize performance</li>
                    <li>• <strong>Milestone:</strong> ₱4,000 salary increase earned!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Metrics */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            Your Success Metrics
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-bold mb-2">Performance Excellence</h4>
              <ul className="text-sm space-y-1">
                <li>• Complete all training milestones</li>
                <li>• Deliver measurable client value</li>
                <li>• Maintain quality standards</li>
              </ul>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-bold mb-2">Client Impact</h4>
              <ul className="text-sm space-y-1">
                <li>• Increase lead generation quality</li>
                <li>• Improve process efficiency</li>
                <li>• Enhance digital presence</li>
              </ul>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-bold mb-2">Career Growth</h4>
              <ul className="text-sm space-y-1">
                <li>• Master cutting-edge technologies</li>
                <li>• Become strategic business partner</li>
                <li>• Position for future opportunities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Motivation Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🌟 Your Journey Starts Now!</h3>
            <p className="text-gray-600 mb-4">
              Leo, this transformation isn't just about learning new tools - it's about evolving your career 
              and becoming an invaluable strategic partner. Michael chose to invest in you because he sees 
              your potential. Now it's time to unlock it!
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">
                "Every expert was once a beginner. Every pro was once an amateur. 
                Every icon was once an unknown." - Start your journey today! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeoDevGuide;