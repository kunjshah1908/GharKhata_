import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { OpenAI } from 'openai';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  // Database query functions for real-time data access
  const queryExpenditureData = async (timeframe?: string) => {
    if (!currentFamily?.id) return null;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('family_id', currentFamily.id)
      .eq('type', 'expense');

    // Apply timeframe filter
    if (timeframe) {
      const now = new Date();
      let startDate: Date;

      switch (timeframe.toLowerCase()) {
        case 'month':
        case 'this month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'week':
        case 'this week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case 'year':
        case 'this year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default to this month
      }

      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  };

  const queryIncomeData = async (timeframe?: string) => {
    if (!currentFamily?.id) return null;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('family_id', currentFamily.id)
      .eq('type', 'income');

    if (timeframe) {
      const now = new Date();
      let startDate: Date;

      switch (timeframe.toLowerCase()) {
        case 'month':
        case 'this month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'week':
        case 'this week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case 'year':
        case 'this year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  };

  const queryBudgetData = async () => {
    if (!currentFamily?.id) return null;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) throw error;
    return data;
  };

  const queryGoalsData = async () => {
    if (!currentFamily?.id) return null;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) throw error;
    return data;
  };

  const queryAssetsLiabilitiesData = async () => {
    if (!currentFamily?.id) return null;

    // Assets and liabilities are stored in goals table with naming conventions
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('family_id', currentFamily.id);

    if (error) throw error;

    const assets = data?.filter(
      (g) => !["Loan", "Taxes", "Debt", "Liability"].some((type) =>
        g.name.toLowerCase().includes(type.toLowerCase())
      )
    ) || [];

    const liabilities = data?.filter(
      (g) => ["Loan", "Taxes", "Debt", "Liability"].some((type) =>
        g.name.toLowerCase().includes(type.toLowerCase())
      )
    ) || [];

    return { assets, liabilities };
  };

  const queryObligationsData = async () => {
    if (!currentFamily?.id) return null;

    const { data, error } = await supabase
      .from('obligations')
      .select('*')
      .eq('family_id', currentFamily.id)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  };

  // Analyze user question and determine what data to query
  const analyzeQuestion = (question: string) => {
    const q = question.toLowerCase();

    const analysis = {
      queryExpenditure: false,
      queryIncome: false,
      queryBudget: false,
      queryGoals: false,
      queryAssets: false,
      queryLiabilities: false,
      queryObligations: false,
      timeframe: '',
      category: '',
      specificQuery: ''
    };

    // Detect expenditure queries
    if (q.includes('spend') || q.includes('expense') || q.includes('expenditure') ||
        q.includes('cost') || q.includes('paid') || q.includes('bought')) {
      analysis.queryExpenditure = true;
    }

    // Detect income queries
    if (q.includes('income') || q.includes('earn') || q.includes('salary') ||
        q.includes('revenue') || q.includes('received') || q.includes('made')) {
      analysis.queryIncome = true;
    }

    // Detect budget queries
    if (q.includes('budget') || q.includes('limit') || q.includes('allowance')) {
      analysis.queryBudget = true;
    }

    // Detect goals/savings queries
    if (q.includes('goal') || q.includes('saving') || q.includes('save') ||
        q.includes('target') || q.includes('fund')) {
      analysis.queryGoals = true;
    }

    // Detect assets queries
    if (q.includes('asset') || q.includes('worth') || q.includes('own') ||
        q.includes('property') || q.includes('investment')) {
      analysis.queryAssets = true;
    }

    // Detect liabilities queries
    if (q.includes('liabilit') || q.includes('debt') || q.includes('loan') ||
        q.includes('owe') || q.includes('borrow')) {
      analysis.queryLiabilities = true;
    }

    // Detect obligations queries
    if (q.includes('bill') || q.includes('obligation') || q.includes('due') ||
        q.includes('payment') || q.includes('emi') || q.includes('rent')) {
      analysis.queryObligations = true;
    }

    // Extract timeframe
    if (q.includes('this month') || q.includes('month')) {
      analysis.timeframe = 'month';
    } else if (q.includes('this week') || q.includes('week')) {
      analysis.timeframe = 'week';
    } else if (q.includes('this year') || q.includes('year')) {
      analysis.timeframe = 'year';
    }

    // Extract category (basic implementation)
    const categories = ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education'];
    for (const cat of categories) {
      if (q.includes(cat)) {
        analysis.category = cat;
        break;
      }
    }

    analysis.specificQuery = question;

    return analysis;
  };

  // Test API key and get available models
  const testGroqConnection = async () => {
    try {
      console.log('Testing Groq API connection...');
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Available Groq models:', data.data?.map((m: any) => m.id) || 'No models found');
      return data.data || [];
    } catch (error) {
      console.error('Groq API test failed:', error);
      return null;
    }
  };

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Mock response generator for when API fails
  const generateMockResponse = (userQuestion: string, context: string) => {
    const question = userQuestion.toLowerCase();

    if (question.includes('spend') || question.includes('expense')) {
      return "Based on your recent transactions, I can see your spending patterns. To give you a detailed analysis, I'd need to access the AI service. Please check your API configuration or try again later.";
    }

    if (question.includes('budget')) {
      return "I can help you analyze your budget categories and spending limits. Your budget data is available, but I need the AI service to provide personalized insights.";
    }

    if (question.includes('goal') || question.includes('saving')) {
      return "Your savings goals look well-structured! I can provide detailed progress analysis and recommendations once the AI service is connected.";
    }

    if (question.includes('bill') || question.includes('obligation')) {
      return "I can see your upcoming financial obligations. To help you manage them better, please ensure the AI service is properly configured.";
    }

    return "I'm here to help with your financial questions! Your data is securely loaded, but I need the AI service to provide detailed insights. Please check your API configuration.";
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Analyze the question to determine what data to query
      const questionAnalysis = analyzeQuestion(input);
      console.log('Question analysis:', questionAnalysis);

      // Query relevant data based on the question
      const queryPromises = [];

      if (questionAnalysis.queryExpenditure) {
        queryPromises.push(queryExpenditureData(questionAnalysis.timeframe));
      }
      if (questionAnalysis.queryIncome) {
        queryPromises.push(queryIncomeData(questionAnalysis.timeframe));
      }
      if (questionAnalysis.queryBudget) {
        queryPromises.push(queryBudgetData());
      }
      if (questionAnalysis.queryGoals) {
        queryPromises.push(queryGoalsData());
      }
      if (questionAnalysis.queryAssets || questionAnalysis.queryLiabilities) {
        queryPromises.push(queryAssetsLiabilitiesData());
      }
      if (questionAnalysis.queryObligations) {
        queryPromises.push(queryObligationsData());
      }

      // If no specific queries were triggered, query all data as fallback
      if (queryPromises.length === 0) {
        queryPromises.push(
          queryExpenditureData(),
          queryIncomeData(),
          queryBudgetData(),
          queryGoalsData(),
          queryAssetsLiabilitiesData(),
          queryObligationsData()
        );
      }

      // Execute queries
      const queryResults = await Promise.allSettled(queryPromises);

      // Build context from query results
      let context = `Family: ${currentFamily?.name || 'Unknown'} (${currentFamily?.currency || 'INR'})\n\n`;

      queryResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const data = result.value;

          // Add data based on what was queried
          if (questionAnalysis.queryExpenditure && Array.isArray(data) && data[0]?.type === 'expense') {
            context += `RECENT EXPENDITURES ${questionAnalysis.timeframe ? `(${questionAnalysis.timeframe.toUpperCase()})` : ''}:\n`;
            data.slice(0, 10).forEach((t: any) => {
              context += `${t.date}: ${t.category} - ${currentFamily?.currency || 'INR'} ${t.amount}`;
              if (t.description) context += ` - ${t.description}`;
              context += '\n';
            });
            context += '\n';
          }

          if (questionAnalysis.queryIncome && Array.isArray(data) && data[0]?.type === 'income') {
            context += `RECENT INCOME ${questionAnalysis.timeframe ? `(${questionAnalysis.timeframe.toUpperCase()})` : ''}:\n`;
            data.slice(0, 10).forEach((t: any) => {
              context += `${t.date}: ${t.category} - ${currentFamily?.currency || 'INR'} ${t.amount}`;
              if (t.description) context += ` - ${t.description}`;
              context += '\n';
            });
            context += '\n';
          }

          if (questionAnalysis.queryBudget && Array.isArray(data) && data[0]?.monthly_limit) {
            context += 'BUDGETS:\n';
            data.forEach((b: any) => {
              context += `${b.category}: ${currentFamily?.currency || 'INR'} ${b.monthly_limit} per month\n`;
            });
            context += '\n';
          }

          if (questionAnalysis.queryGoals && Array.isArray(data) && data[0]?.target_amount) {
            context += 'GOALS/SAVINGS:\n';
            data.forEach((g: any) => {
              const progress = ((g.current_amount / g.target_amount) * 100).toFixed(1);
              context += `${g.name}: ${currentFamily?.currency || 'INR'} ${g.current_amount} / ${currentFamily?.currency || 'INR'} ${g.target_amount} (${progress}%)`;
              if (g.deadline) context += ` - Deadline: ${g.deadline}`;
              context += '\n';
            });
            context += '\n';
          }

          if ((questionAnalysis.queryAssets || questionAnalysis.queryLiabilities) && data.assets) {
            if (questionAnalysis.queryAssets) {
              context += 'ASSETS:\n';
              data.assets.forEach((a: any) => {
                const progress = ((a.current_amount / a.target_amount) * 100).toFixed(1);
                context += `${a.name}: ${currentFamily?.currency || 'INR'} ${a.current_amount}`;
                if (a.target_amount > 0) context += ` / ${currentFamily?.currency || 'INR'} ${a.target_amount} (${progress}%)`;
                context += '\n';
              });
              context += '\n';
            }

            if (questionAnalysis.queryLiabilities) {
              context += 'LIABILITIES:\n';
              data.liabilities.forEach((l: any) => {
                const progress = ((l.current_amount / l.target_amount) * 100).toFixed(1);
                context += `${l.name}: ${currentFamily?.currency || 'INR'} ${l.current_amount}`;
                if (l.target_amount > 0) context += ` / ${currentFamily?.currency || 'INR'} ${l.target_amount} (${progress}%)`;
                context += '\n';
              });
              context += '\n';
            }
          }

          if (questionAnalysis.queryObligations && Array.isArray(data) && data[0]?.due_day) {
            context += 'UPCOMING OBLIGATIONS:\n';
            data.forEach((o: any) => {
              context += `${o.name}: ${currentFamily?.currency || 'INR'} ${o.amount} (${o.category}) - Due on day ${o.due_day}\n`;
            });
            context += '\n';
          }
        }
      });

      // Test Groq connection and get available models
      const availableModels = await testGroqConnection();

      if (!availableModels || availableModels.length === 0) {
        console.warn('No models available from Groq API, using mock response');
        const mockResponse = generateMockResponse(input, context);
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Use available models from API
      const modelsToTry = availableModels.slice(0, 3).map((m: any) => m.id);
      console.log('Will try models:', modelsToTry);
      let completion;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Groq model: ${modelName}`);
          completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful financial assistant for a family finance management app. You have access to the user\'s real financial data from their database. Answer questions about their finances based on the provided data. Be conversational and friendly. If they ask about something not in the data, let them know you can only provide information based on what\'s stored in their account. Provide specific numbers and details from the data when relevant.'
              },
              {
                role: 'user',
                content: `Based on my financial data below, please answer: ${input}\n\n${context}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          });
          console.log(`Success with Groq model: ${modelName}`);
          break;
        } catch (modelError) {
          console.warn(`Groq model ${modelName} failed:`, modelError);
          if (modelName === modelsToTry[modelsToTry.length - 1]) {
            console.warn('All models failed, using mock response');
            const mockResponse = generateMockResponse(input, context);
            const assistantMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: mockResponse,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
            return;
          }
        }
      }

      const text = completion!.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);

      // Final fallback: mock response
      const context = currentFamily ? `Family: ${currentFamily.name} (${currentFamily.currency})` : '';
      const mockResponse = generateMockResponse(input, context);

      const assistantMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Financial Assistant
          </DialogTitle>
          <DialogDescription>
            Chat with your financial assistant to get insights about your finances
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hi! I'm your financial assistant. Ask me anything about your finances!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Chatbot;