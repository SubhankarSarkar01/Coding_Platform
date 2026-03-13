import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Send, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LeetCodeProblemPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunn