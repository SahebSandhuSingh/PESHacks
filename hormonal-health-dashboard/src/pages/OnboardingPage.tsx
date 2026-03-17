import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Activity, 
  Moon, 
  FileText, 
  AlertCircle,
  Stethoscope,
  Pill,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'file';
  options?: string[];
  icon: React.ReactNode;
}

const QUESTIONS: Question[] = [
  {
    id: 'dob',
    title: 'What is your date of birth?',
    description: 'Calculates age, adjusts ML baselines — PCOS severity varies by age group',
    type: 'date',
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: 'height_weight',
    title: 'What is your height and weight?',
    description: 'Calculates BMI — obesity and PCOS are directly linked',
    type: 'text',
    icon: <Scale className="w-6 h-6" />
  },
  {
    id: 'last_period',
    title: 'When did your last period start?',
    description: 'Most critical — predicts next cycle and flags missed periods',
    type: 'date',
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: 'cycle_length',
    title: 'How many days is your usual cycle?',
    description: 'Identifies irregular cycles — red flag if >35 or <21 days',
    type: 'number',
    icon: <Activity className="w-6 h-6" />
  },
  {
    id: 'diagnosed',
    title: 'Have you been diagnosed with PCOS or PCOD?',
    description: 'Sets ML model sensitivity — diagnosed women need tighter guards',
    type: 'select',
    options: ['Yes', 'No', 'Suspected'],
    icon: <AlertCircle className="w-6 h-6" />
  },
  {
    id: 'symptoms',
    title: 'Which symptoms do you currently experience?',
    description: 'More symptoms = higher alert sensitivity',
    type: 'multiselect',
    options: ['Weight gain', 'Acne', 'Hair loss', 'Fatigue', 'Mood swings', 'Irregular periods'],
    icon: <Stethoscope className="w-6 h-6" />
  },
  {
    id: 'medication',
    title: 'Are you currently on any PCOS medication?',
    description: 'Medication affects heart rate and temperature baselines',
    type: 'text',
    icon: <Pill className="w-6 h-6" />
  },
  {
    id: 'activity',
    title: 'What is your typical daily activity level?',
    description: 'Calibrates heart rate normals for your fitness level',
    type: 'select',
    options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'],
    icon: <Activity className="w-6 h-6" />
  },
  {
    id: 'sleep',
    title: 'How many hours do you sleep on average?',
    description: 'Sleep deprivation causes elevated HR and temperature',
    type: 'number',
    icon: <Moon className="w-6 h-6" />
  },
  {
    id: 'report',
    title: 'Upload your latest gynecologist report',
    description: 'LH, FSH levels directly inform anomaly detection',
    type: 'file',
    icon: <FileText className="w-6 h-6" />
  }
];

export const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const { setCompletedOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompletedOnboarding(true);
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: value }));
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Animated Smooth Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 blur-[120px] rounded-full animate-pulse MixBlendMode-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300/30 blur-[100px] rounded-full animate-pulse [animation-delay:2s] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-300/20 blur-[120px] rounded-full animate-pulse [animation-delay:4s] mix-blend-multiply" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-teal-600 font-semibold mb-1 tracking-wide uppercase text-sm">Step {currentStep + 1} of {QUESTIONS.length}</p>
              <h2 className="text-slate-900 text-3xl font-extrabold tracking-tight">Registration</h2>
            </div>
            <p className="text-slate-500 font-medium">{Math.round(progress)}% Complete</p>
          </div>
          <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[450px] flex flex-col relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none rounded-[2rem]"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-grow flex flex-col"
            >
              <div className="mb-8 flex items-center gap-4 relative z-10">
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100/50 text-teal-600 shadow-sm shadow-teal-500/10">
                  {QUESTIONS[currentStep].icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                  {QUESTIONS[currentStep].title}
                </h3>
              </div>

              <p className="text-slate-500 text-lg mb-10 leading-relaxed relative z-10">
                {QUESTIONS[currentStep].description}
              </p>

              <div className="flex-grow relative z-10">
                {QUESTIONS[currentStep].type === 'date' && (
                  <input 
                    type="date"
                    className="w-full bg-white/50 border border-slate-200 text-slate-800 rounded-2xl p-5 text-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 transition-all font-medium appearance-none shadow-sm"
                    value={answers[QUESTIONS[currentStep].id] || ''}
                    onChange={(e) => updateAnswer(e.target.value)}
                  />
                )}
                
                {QUESTIONS[currentStep].type === 'number' && (
                  <input 
                    type="number"
                    placeholder="Enter value..."
                    className="w-full bg-white/50 border border-slate-200 text-slate-800 rounded-2xl p-5 text-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 transition-all font-medium shadow-sm placeholder:text-slate-400"
                    value={answers[QUESTIONS[currentStep].id] || ''}
                    onChange={(e) => updateAnswer(e.target.value)}
                  />
                )}

                {QUESTIONS[currentStep].type === 'text' && (
                  <input 
                    type="text"
                    placeholder="Enter value..."
                    className="w-full bg-white/50 border border-slate-200 text-slate-800 rounded-2xl p-5 text-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 transition-all font-medium shadow-sm placeholder:text-slate-400"
                    value={answers[QUESTIONS[currentStep].id] || ''}
                    onChange={(e) => updateAnswer(e.target.value)}
                  />
                )}

                {QUESTIONS[currentStep].type === 'select' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUESTIONS[currentStep].options?.map(option => (
                      <button
                        key={option}
                        onClick={() => updateAnswer(option)}
                        className={`p-5 rounded-2xl text-left text-lg font-medium border-2 transition-all shadow-sm ${
                          answers[QUESTIONS[currentStep].id] === option
                            ? 'bg-teal-50 border-teal-500 text-teal-800'
                            : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {QUESTIONS[currentStep].type === 'multiselect' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUESTIONS[currentStep].options?.map(option => {
                      const selected = (answers[QUESTIONS[currentStep].id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            const current = answers[QUESTIONS[currentStep].id] || [];
                            if (selected) {
                              updateAnswer(current.filter((o: string) => o !== option));
                            } else {
                              updateAnswer([...current, option]);
                            }
                          }}
                          className={`p-5 rounded-2xl text-left text-lg font-medium border-2 transition-all shadow-sm ${
                            selected
                              ? 'bg-teal-50 border-teal-500 text-teal-800'
                              : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {QUESTIONS[currentStep].type === 'file' && (
                  <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 bg-white/50 hover:bg-teal-50/50 hover:border-teal-400 transition-all cursor-pointer group shadow-sm">
                    <FileText className="w-10 h-10 text-slate-400 mb-2 group-hover:text-teal-500 transition-colors" />
                    <p className="text-slate-600 group-hover:text-teal-700 font-medium transition-colors">Click to upload report</p>
                    <p className="text-slate-400 text-sm mt-1">PDF, JPG or PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex justify-between gap-4 relative z-10">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-bold ${
                currentStep === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-400 hover:to-teal-500 transition-all font-bold shadow-lg shadow-teal-500/20 active:scale-95"
            >
              {currentStep === QUESTIONS.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Your data is encrypted and used only for personalizing your physiological model.
        </p>
      </div>
    </div>
  );
};
