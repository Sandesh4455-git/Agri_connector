// ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from '../../context/AuthContext';
import './ChatBot.css';

const ChatBot = ({ userType = 'farmer' }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showLanguageOptions, setShowLanguageOptions] = useState(true);
    const [showCategoryOptions, setShowCategoryOptions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const sessionId = useRef(
        localStorage.getItem('chatSessionId') ||
        'session_' + Date.now()
    );

    // Define categories based on user type and language
    const getFarmerCategories = (lang) => {
        const categories = {
            english: [
                { id: 'price', label: '💰 Market Price', icon: '📊' },
                { id: 'schemes', label: '🏛️ Government Schemes', icon: '📜' },
                { id: 'crops', label: '🌾 My Crops', icon: '🌱' },
                { id: 'deals', label: '🤝 My Deals', icon: '📦' },
                { id: 'advice', label: '🌿 Farming Advice', icon: '👨‍🌾' }
            ],
            marathi: [
                { id: 'price', label: '💰 बाजारभाव', icon: '📊' },
                { id: 'schemes', label: '🏛️ सरकारी योजना', icon: '📜' },
                { id: 'crops', label: '🌾 माझी पिके', icon: '🌱' },
                { id: 'deals', label: '🤝 माझे व्यवहार', icon: '📦' },
                { id: 'advice', label: '🌿 शेती सल्ला', icon: '👨‍🌾' }
            ],
            hindi: [
                { id: 'price', label: '💰 बाजार भाव', icon: '📊' },
                { id: 'schemes', label: '🏛️ सरकारी योजनाएँ', icon: '📜' },
                { id: 'crops', label: '🌾 मेरी फसलें', icon: '🌱' },
                { id: 'deals', label: '🤝 मेरे सौदे', icon: '📦' },
                { id: 'advice', label: '🌿 खेती सलाह', icon: '👨‍🌾' }
            ]
        };
        return categories[lang] || categories.english;
    };

    const getDealerCategories = (lang) => {
        const categories = {
            english: [
                { id: 'price', label: '💰 Market Price', icon: '📊' },
                { id: 'buy', label: '🛒 Buy Produce', icon: '🛍️' },
                { id: 'suppliers', label: '👥 Find Farmers', icon: '👨‍🌾' },
                { id: 'deals', label: '🤝 My Deals', icon: '📦' },
                { id: 'trends', label: '📈 Market Trends', icon: '📉' }
            ],
            marathi: [
                { id: 'price', label: '💰 बाजारभाव', icon: '📊' },
                { id: 'buy', label: '🛒 माल खरेदी', icon: '🛍️' },
                { id: 'suppliers', label: '👥 शेतकरी शोधा', icon: '👨‍🌾' },
                { id: 'deals', label: '🤝 माझे व्यवहार', icon: '📦' },
                { id: 'trends', label: '📈 बाजार ट्रेंड', icon: '📉' }
            ],
            hindi: [
                { id: 'price', label: '💰 बाजार भाव', icon: '📊' },
                { id: 'buy', label: '🛒 उपज खरीदें', icon: '🛍️' },
                { id: 'suppliers', label: '👥 किसान खोजें', icon: '👨‍🌾' },
                { id: 'deals', label: '🤝 मेरे सौदे', icon: '📦' },
                { id: 'trends', label: '📈 बाजार रुझान', icon: '📉' }
            ]
        };
        return categories[lang] || categories.english;
    };

    // Language options
    const languageOptions = [
        { code: 'english', label: 'English', icon: '' },
        { code: 'marathi', label: 'मराठी', icon: '' },
        { code: 'hindi', label: 'हिंदी', icon: '' }
    ];

    useEffect(() => {
        localStorage.setItem('chatSessionId', sessionId.current);
        
        const initialMessage = {
            text: "👋 Welcome to AgriAssist! Please choose your language:",
            sender: 'bot',
            timestamp: new Date(),
            isPrompt: true
        };
        setMessages([initialMessage]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (transcript) {
            setInputMessage(transcript);
        }
    }, [transcript]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        setShowLanguageOptions(false);
        
        const selectedLang = languageOptions.find(l => l.code === langCode);
        setMessages(prev => [...prev, {
            text: `${selectedLang.icon} ${selectedLang.label}`,
            sender: 'user',
            timestamp: new Date()
        }]);

        setTimeout(() => {
            const categoryPrompt = getCategoryPrompt(langCode, userType);
            setMessages(prev => [...prev, {
                text: categoryPrompt,
                sender: 'bot',
                timestamp: new Date(),
                isPrompt: true
            }]);
            setShowCategoryOptions(true);
        }, 100);
    };

    const getCategoryPrompt = (lang, uType) => {
        const prompts = {
            english: {
                farmer: "🌾 Please choose a category below to get started:",
                dealer: "🏪 Please choose a category below to get started:"
            },
            marathi: {
                farmer: "🌾 कृपया सुरू करण्यासाठी खालील श्रेणी निवडा:",
                dealer: "🏪 कृपया सुरू करण्यासाठी खालील श्रेणी निवडा:"
            },
            hindi: {
                farmer: "🌾 कृपया शुरू करने के लिए नीचे दी गई श्रेणी चुनें:",
                dealer: "🏪 कृपया शुरू करने के लिए नीचे दी गई श्रेणी चुनें:"
            }
        };
        return prompts[lang]?.[uType] || prompts.english.farmer;
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.id);
        setShowCategoryOptions(false);
        
        const categories = userType === 'farmer' 
            ? getFarmerCategories(selectedLanguage)
            : getDealerCategories(selectedLanguage);
        
        const selectedCat = categories.find(c => c.id === category.id);
        
        setMessages(prev => [...prev, {
            text: `${selectedCat.icon} ${selectedCat.label}`,
            sender: 'user',
            timestamp: new Date()
        }]);

        const questionPrompt = getQuestionPrompt(selectedLanguage, userType, category.id);
        setMessages(prev => [...prev, {
            text: questionPrompt,
            sender: 'bot',
            timestamp: new Date()
        }]);
    };

    const getQuestionPrompt = (lang, uType, categoryId) => {
        const prompts = {
            english: {
                price: "📊 Please ask about market prices (e.g., 'What is tomato price?')",
                schemes: "🏛️ Which government scheme would you like to know about?",
                crops: "🌾 What would you like to know about your crops?",
                deals: "🤝 Ask about your active deals or past transactions",
                advice: "🌿 What farming advice do you need?",
                buy: "🛒 What produce would you like to buy? (e.g., '50 kg onions')",
                suppliers: "👥 What kind of farmers are you looking for?",
                trends: "📈 Which market trends interest you?"
            },
            marathi: {
                price: "📊 कृपया बाजारभाव विचारा (उदा. 'टोमॅटोचा भाव काय?')",
                schemes: "🏛️ कोणत्या सरकारी योजनेबद्दल माहिती हवी आहे?",
                crops: "🌾 तुमच्या पिकांबद्दल काय जाणून घ्यायचे आहे?",
                deals: "🤝 तुमच्या व्यवहारांबद्दल विचारा",
                advice: "🌿 कोणता शेती सल्ला हवा आहे?",
                buy: "🛒 कोणता माल खरेदी करायचा आहे? (उदा. '50 किलो कांदे')",
                suppliers: "👥 कसे शेतकरी शोधत आहात?",
                trends: "📈 कोणते बाजार ट्रेंड पहायचे आहेत?"
            },
            hindi: {
                price: "📊 कृपया बाजार भाव पूछें (उदा. 'टमाटर का भाव क्या है?')",
                schemes: "🏛️ किस सरकारी योजना के बारे में जानना चाहेंगे?",
                crops: "🌾 अपनी फसलों के बारे में क्या जानना चाहेंगे?",
                deals: "🤝 अपने सौदों के बारे में पूछें",
                advice: "🌿 कौन सी खेती सलाह चाहिए?",
                buy: "🛒 कौन सी उपज खरीदना चाहेंगे? (उदा. '50 किलो आलू')",
                suppliers: "👥 कैसे किसान ढूंढ रहे हैं?",
                trends: "📈 कौन से बाजार रुझान देखना चाहेंगे?"
            }
        };
        return prompts[lang]?.[categoryId] || "Please ask your question:";
    };

   const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log('🚀 Sending message:', inputMessage);
    console.log('📝 Selected language:', selectedLanguage);

    const userMsg = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]);

    try {
        console.log('📡 Sending request to backend...');
        
        const res = await fetch('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: inputMessage,
                userType: userType,
                sessionId: sessionId.current,
                queryType: 'ask_anything',
                userId: user?.id,
                language: selectedLanguage,
                category: selectedCategory
            })
        });

        console.log('📥 Response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('📦 Response data:', data);

        // ✅ FIX: Check both data.response and data.message
        const botResponse = data.response || data.message || "I couldn't understand that. Please try again.";
        
        setMessages(prev => [...prev, {
            text: botResponse,
            sender: 'bot',
            timestamp: new Date()
        }]);

    } catch (err) {
        console.error('❌ Fetch error:', err);
        
        const errorMessages = {
            english: "Sorry, I'm having trouble connecting. Please try again.",
            marathi: "क्षमस्व, कनेक्शन समस्या आहे. कृपया पुन्हा प्रयत्न करा.",
            hindi: "क्षमा करें, कनेक्शन समस्या है। कृपया पुनः प्रयास करें।"
        };
        
        const lang = selectedLanguage || 'english';
        const errorText = errorMessages[lang] || errorMessages.english;
        
        setMessages(prev => [...prev, {
            text: errorText,
            sender: 'bot',
            timestamp: new Date(),
            isError: true
        }]);
    } finally {
        setIsLoading(false);
    }
};

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ 
                continuous: true, 
                language: selectedLanguage === 'marathi' ? 'mr-IN' : 
                          selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN' 
            });
        }
    };

    return (
        <div className="chatbot-container">
            {/* HEADER */}
            <div className="chat-header">
                <div className="header-top">
                    <div className="bot-info">
                        <div className="bot-avatar">
                            {userType === 'farmer' ? '🌾' : '🏪'}
                        </div>
                        <div>
                            <div className="bot-name">
                                AgriAssist <span className="bot-badge">AI</span>
                            </div>
                            <div className="bot-role">
                                {userType === 'farmer' ? 'शेतकरी सहाय्यक' : 'व्यापारी सहाय्यक'}
                                {selectedLanguage && ` • ${languageOptions.find(l => l.code === selectedLanguage)?.icon}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                        <div className="message-content">
                            {msg.text}
                        </div>
                        <div className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}

                {/* LANGUAGE OPTIONS */}
                {showLanguageOptions && (
                    <div className="options-container">
                        {languageOptions.map(lang => (
                            <button
                                key={lang.code}
                                className="option-button"
                                onClick={() => handleLanguageSelect(lang.code)}
                            >
                                <span className="option-icon">{lang.icon}</span>
                                <span className="option-label">{lang.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* CATEGORY OPTIONS */}
                {showCategoryOptions && selectedLanguage && (
                    <div className="options-container">
                        {(userType === 'farmer' 
                            ? getFarmerCategories(selectedLanguage)
                            : getDealerCategories(selectedLanguage)
                        ).map(cat => (
                            <button
                                key={cat.id}
                                className="option-button"
                                onClick={() => handleCategorySelect(cat)}
                            >
                                <span className="option-icon">{cat.icon}</span>
                                <span className="option-label">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && (
                    <div className="message bot">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT - only show after language and category selected */}
            {selectedLanguage && !showLanguageOptions && !showCategoryOptions && (
                <div className="chat-input">
                    <div className="input-wrapper">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                selectedLanguage === 'marathi' ? 'तुमचा प्रश्न येथे लिहा...' :
                                selectedLanguage === 'hindi' ? 'अपना प्रश्न यहाँ लिखें...' :
                                'Type your question here...'
                            }
                            rows="1"
                        />
                    </div>

                    {browserSupportsSpeechRecognition && (
                        <button
                            onClick={toggleListening}
                            className={`action-btn ${listening ? 'listening' : ''}`}
                            title={listening ? 'Stop listening' : 'Start voice input'}
                        >
                            🎤
                        </button>
                    )}

                    <button
                        onClick={sendMessage}
                        className="action-btn send-btn"
                        disabled={!inputMessage.trim() || isLoading}
                    >
                        ➤
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatBot;