import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerChatbot.css";

export default function CustomerChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hi! 🐾 Welcome to Pawesome Pet Care! I'm your AI assistant. I can help you:",
      type: "intro"
    },
    {
      sender: "bot",
      text: "📅 Book appointments (grooming, veterinary, boarding)\n🛍️ Shop for pet supplies\n📋 Answer questions about our services\n🏥 Get pet care advice",
      type: "options"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectIntent = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Booking intents
    if (input.includes('book') || input.includes('appointment') || input.includes('schedule')) {
      if (input.includes('groom')) return 'book_grooming';
      if (input.includes('vet') || input.includes('veterinary') || input.includes('checkup')) return 'book_vet';
      if (input.includes('board') || input.includes('hotel') || input.includes('stay')) return 'book_boarding';
      return 'book_general';
    }
    
    // Service information
    if (input.includes('grooming') || input.includes('groom')) return 'info_grooming';
    if (input.includes('veterinary') || input.includes('vet') || input.includes('doctor')) return 'info_vet';
    if (input.includes('boarding') || input.includes('hotel') || input.includes('stay')) return 'info_boarding';
    
    // Store related
    if (input.includes('store') || input.includes('shop') || input.includes('buy')) return 'store';
    if (input.includes('delivery') || input.includes('ship')) return 'delivery';
    if (input.includes('price') || input.includes('cost') || input.includes('fee')) return 'pricing';
    
    // General questions
    if (input.includes('hour') || input.includes('time') || input.includes('open')) return 'hours';
    if (input.includes('contact') || input.includes('phone') || input.includes('email')) return 'contact';
    if (input.includes('location') || input.includes('address') || input.includes('where')) return 'location';
    
    // Pet care advice
    if (input.includes('care') || input.includes('advice') || input.includes('help')) return 'pet_care';
    
    return 'general';
  };

  const generateResponse = (intent, userInput) => {
    const responses = {
      book_grooming: {
        text: "I'd be happy to help you book a grooming appointment! 🐕✂️\n\nWhat type of grooming service do you need?",
        quickReplies: ['Basic Bath', 'Full Grooming', 'Nail Trimming', 'Teeth Cleaning'],
        action: 'start_grooming_booking'
      },
      book_vet: {
        text: "I can help you schedule a veterinary checkup! 🏥\n\nWhat type of appointment do you need?",
        quickReplies: ['Regular Checkup', 'Vaccination', 'Emergency', 'Surgery Consultation'],
        action: 'start_vet_booking'
      },
      book_boarding: {
        text: "Let's book a pet boarding stay! 🏨\n\nHow long will your pet be staying with us?",
        quickReplies: ['1 Day', '2-3 Days', '1 Week', '2+ Weeks'],
        action: 'start_boarding_booking'
      },
      book_general: {
        text: "I can help you book an appointment! What type of service are you looking for?",
        quickReplies: ['Grooming', 'Veterinary', 'Boarding', 'Store Products'],
        action: 'service_selection'
      },
      info_grooming: {
        text: "Our grooming services include: �️\n\n• Basic Bath & Dry - ₱300\n• Full Grooming - ₱800\n• Nail Trimming - ₱150\n• Teeth Cleaning - ₱200\n\nWould you like to book an appointment?",
        quickReplies: ['Book Grooming', 'See Prices', 'Grooming FAQ']
      },
      info_vet: {
        text: "Our veterinary services: 🏥\n\n• General Checkups - ₱500\n• Vaccinations - ₱800\n• Emergency Care - ₱1200\n• Surgery - Price varies\n\nOur vets are available Mon-Sat, 9AM-6PM. Need an appointment?",
        quickReplies: ['Book Vet Visit', 'Emergency Info', 'Vaccination Schedule']
      },
      info_boarding: {
        text: "Pet boarding services: 🏨\n\n• Day Care - ₱200/day\n• Overnight - ₱400/night\n• Weekly Package - ₱2500\n• Premium Suite - ₱600/night\n\nIncludes meals, exercise, and 24/7 care!",
        quickReplies: ['Book Boarding', 'Facility Tour', 'What to Bring']
      },
      store: {
        text: "Our pet store has everything you need! 🛍️\n\n• Premium pet food\n• Toys and accessories\n• Grooming supplies\n• Health products\n\nWould you like me to take you to the store?",
        quickReplies: ['Go to Store', 'Food Products', 'Accessories', 'Current Promos']
      },
      delivery: {
        text: "Delivery information: 🚚\n\n• Free delivery for orders ₱1000+\n• Standard delivery - ₱50 (2-3 days)\n• Express delivery - ₱120 (same day)\n• Nationwide coverage\n\nWe deliver daily from 10AM-7PM!",
        quickReplies: ['Track Order', 'Delivery Areas', 'Packaging Info']
      },
      pricing: {
        text: "Our pricing varies by service: 💰\n\nGrooming: ₱150-800\nVeterinary: ₱300-1200+\nBoarding: ₱200-600/night\nStore: Various price points\n\nWould you like detailed pricing for a specific service?",
        quickReplies: ['Grooming Prices', 'Vet Prices', 'Boarding Rates', 'Store Deals']
      },
      hours: {
        text: "Our operating hours: 🕐\n\n• Monday-Friday: 9AM-8PM\n• Saturday: 9AM-6PM\n• Sunday: 10AM-5PM\n• Emergency Vet: 24/7 hotline\n\nHow can I help you today?",
        quickReplies: ['Book Appointment', 'Emergency Contact', 'Holiday Hours']
      },
      contact: {
        text: "Contact Information: 📞\n\n• Phone: (02) 123-4567\n• Email: care@pawesome.com\n• Emergency: 0917-888-PAWS\n• Address: 123 Pet Street, Manila\n\nWhat's the best way to assist you?",
        quickReplies: ['Call Now', 'Email Support', 'Visit Location']
      },
      location: {
        text: "We're conveniently located: 📍\n\n🏥 123 Pet Street, Manila\n🅿️ Free parking available\n🚌 Near MRT Station\n\nWould you like directions or prefer to book online?",
        quickReplies: ['Get Directions', 'Book Online', 'Virtual Tour']
      },
      pet_care: {
        text: "Pet care tips! 🐾\n\n• Regular grooming prevents skin issues\n• Annual vet checkups are essential\n• Balanced diet keeps pets healthy\n• Exercise improves behavior\n\nWhat specific advice do you need?",
        quickReplies: ['Puppy Care', 'Kitten Tips', 'Senior Pet Care', 'Nutrition Advice']
      },
      general: {
        text: "I'm here to help! 🐾\n\nI can assist with:\n• Booking appointments\n• Service information\n• Store orders\n• Pet care advice\n• General questions\n\nWhat would you like to know?",
        quickReplies: ['Book Appointment', 'Services', 'Store', 'Contact']
      }
    };

    return responses[intent] || responses.general;
  };

  const handleQuickReply = (reply, action) => {
    const userMsg = { sender: "user", text: reply };
    setMessages(prev => [...prev, userMsg]);
    
    setIsTyping(true);
    
    setTimeout(() => {
      if (action?.includes('booking')) {
        handleBookingFlow(action, reply);
      } else if (action === 'go_to_store') {
        const botMsg = { 
          sender: "bot", 
          text: "Taking you to our store now! 🛍️",
          type: "navigation"
        };
        setMessages(prev => [...prev, botMsg]);
        setTimeout(() => navigate('/customer/store'), 1500);
      } else {
        const intent = detectIntent(reply);
        const response = generateResponse(intent, reply);
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleBookingFlow = (action, serviceType) => {
    let response;
    
    switch(action) {
      case 'start_grooming_booking':
        setBookingStep('pet_info');
        setBookingData({ service: 'grooming', type: serviceType });
        response = {
          text: "Great choice! 🐕✂️\n\nTo book your grooming appointment, I'll need some information:\n\nWhat's your pet's name?",
          quickReplies: ['Continue Booking', 'Cancel']
        };
        break;
      case 'start_vet_booking':
        setBookingStep('pet_info');
        setBookingData({ service: 'veterinary', type: serviceType });
        response = {
          text: "Perfect! 🏥\n\nFor your veterinary appointment, please tell me:\n\nWhat's your pet's name and type?",
          quickReplies: ['Continue Booking', 'Cancel']
        };
        break;
      case 'start_boarding_booking':
        setBookingStep('pet_info');
        setBookingData({ service: 'boarding', duration: serviceType });
        response = {
          text: "Excellent! 🏨\n\nFor pet boarding, I need to know:\n\nWhat's your pet's name, type, and size?",
          quickReplies: ['Continue Booking', 'Cancel']
        };
        break;
      default:
        response = generateResponse('general', serviceType);
    }
    
    setMessages(prev => [...prev, { sender: "bot", ...response }]);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    
    setIsTyping(true);
    const userInput = input;
    setInput("");
    
    setTimeout(() => {
      if (bookingStep === 'pet_info') {
        setBookingData(prev => ({ ...prev, petName: userInput }));
        const response = {
          text: `Thanks! ${userInput} is a great name! 🐾\n\nWhat's the best date and time for your appointment?`,
          quickReplies: ['Today 2PM', 'Tomorrow 10AM', 'This Weekend', 'Schedule Other']
        };
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
        setBookingStep('datetime');
      } else if (bookingStep === 'datetime') {
        setBookingData(prev => ({ ...prev, datetime: userInput }));
        const response = {
          text: `Perfect! I have you scheduled for ${userInput} ✅\n\nLast question - What's your contact number for confirmation?`,
          quickReplies: ['Provide Phone', 'Cancel Booking']
        };
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
        setBookingStep('contact');
      } else if (bookingStep === 'contact') {
        setBookingData(prev => ({ ...prev, contact: userInput }));
        const response = {
          text: `Thank you! 🎉\n\nYour booking is confirmed!\n\n📅 Service: ${bookingData.service}\n🐾 Pet: ${bookingData.petName}\n⏰ Time: ${bookingData.datetime}\n📞 Contact: ${userInput}\n\nWe'll send you a confirmation shortly. Anything else I can help with?`,
          quickReplies: ['Book Another', 'Go to Dashboard', 'Store']
        };
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
        setBookingStep(null);
        setBookingData({});
      } else {
        const intent = detectIntent(userInput);
        const response = generateResponse(intent, userInput);
        setMessages(prev => [...prev, { sender: "bot", ...response }]);
      }
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-info">
              <div className="bot-avatar">🐾</div>
              <div>
                <div className="bot-name">Pawesome Assistant</div>
                <div className="bot-status">Online • AI Powered</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="close-btn">✕</button>
          </div>
          
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="bot-avatar-small">🐾</div>
                )}
                <div className="msg-content">
                  {msg.text.split('\n').map((line, j) => (
                    <div key={j}>{line}</div>
                  ))}
                  {msg.quickReplies && (
                    <div className="quick-replies">
                      {msg.quickReplies.map((reply, j) => (
                        <button 
                          key={j} 
                          className="quick-reply-btn"
                          onClick={() => handleQuickReply(reply, msg.action)}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="msg bot">
                <div className="bot-avatar-small">🐾</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={bookingStep ? "Type your response..." : "Ask me anything..."}
              disabled={isTyping}
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || isTyping}
              className="send-btn"
            >
              {isTyping ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
      
      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)}>
          <img src="/pawesome-icon.png" alt="Chatbot" />
          <div className="notification-dot"></div>
        </button>
      )}
    </div>
  );
}