    case 'basic_awareness':
                            recommendations.push('Learn the basics of SS7 and mobile network security');
                            break;
                        case 'threat_awareness':
                            recommendations.push('Understand common SS7 attack methods and their indicators');
                            break;
                        case 'security_practices':
                            recommendations.push('Adopt secure mobile banking and communication practices');
                            break;
                        case 'rural_context':
                            recommendations.push('Learn about specific risks in rural Nepal\'s mobile infrastructure');
                            break;
                        case 'technical_knowledge':
                            recommendations.push('Develop technical understanding of SS7 vulnerabilities');
                            break;
                    }
                }
            });
            
            // Risk-level specific recommendations
            switch (riskLevel) {
                case 'Critical':
                    recommendations.unshift('URGENT: Your current knowledge level puts you at high risk. Seek immediate cybersecurity training.');
                    break;
                case 'High':
                    recommendations.unshift('Important: Improve your security awareness to protect against SS7 threats.');
                    break;
                case 'Medium':
                    recommendations.unshift('Good foundation, but there\'s room for improvement in mobile security.');
                    break;
                case 'Low':
                    recommendations.unshift('Excellent! You have strong security awareness. Stay updated on new threats.');
                    break;
            }
            
            return recommendations;
        }
        
        showEnhancedResults(results) {
            this.showSection('results');
            
            // Update risk badge
            const riskBadge = document.getElementById('riskBadge');
            const scoreText = document.getElementById('scoreText');
            
            if (riskBadge) {
                riskBadge.textContent = results.risk_level;
                riskBadge.className = `risk-badge risk-${results.risk_level.toLowerCase()}`;
            }
            
            if (scoreText) {
                scoreText.textContent = `AI Score: ${results.score}/${results.total} (${results.percentage}%)`;
            }
            
            // Show risk factors
            this.updateRiskFactors(results.risk_factors);
            
            // Show AI recommendations
            this.updateAIRecommendations(results.recommendations);
            
            // Show threat landscape
            this.updateThreatLandscape(results);
        }
        
        updateRiskFactors(riskFactors) {
            const riskFactorsContainer = document.getElementById('riskFactors');
            if (!riskFactorsContainer) return;
            
            if (riskFactors.length === 0) {
                riskFactorsContainer.innerHTML = '<div class="risk-factor success">No major risk factors identified</div>';
            } else {
                riskFactorsContainer.innerHTML = riskFactors.map(factor => 
                    `<div class="risk-factor warning">${this.escapeHtml(factor)}</div>`
                ).join('');
            }
        }
        
        updateAIRecommendations(recommendations) {
            const tipsList = document.getElementById('tipsList');
            if (!tipsList) return;
            
            tipsList.innerHTML = '';
            
            recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                tipsList.appendChild(li);
            });
        }
        
        updateThreatLandscape(results) {
            const threatRadar = document.getElementById('threatRadar');
            if (!threatRadar) return;
            
            // Create a simple threat visualization
            const threats = [
                { name: 'OTP Theft', risk: Math.random() * 0.8 + 0.2 },
                { name: 'Location Tracking', risk: Math.random() * 0.6 + 0.1 },
                { name: 'Call Interception', risk: Math.random() * 0.7 + 0.15 },
                { name: 'DoS Attacks', risk: Math.random() * 0.5 + 0.1 }
            ];
            
            threatRadar.innerHTML = `
                <div class="threat-items">
                    ${threats.map(threat => `
                        <div class="threat-item">
                            <span class="threat-name">${threat.name}</span>
                            <div class="threat-bar">
                                <div class="threat-fill" style="width: ${threat.risk * 100}%"></div>
                            </div>
                            <span class="threat-value">${Math.round(threat.risk * 100)}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        resetQuiz() {
            this.quizState.currentQuestion = 0;
            this.quizState.answers = [];
            this.renderQuizQuestions();
            this.updateQuizProgress(0);
        }
        
        updateQuizProgress(progress) {
            const progressFill = document.getElementById('quizProgress');
            const progressText = document.getElementById('progressText');
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}% Complete`;
            }
        }
        
        /* ==================== OPERATOR METHODS ==================== */
        
        async startLiveLogs() {
            this.operatorState.isLogging = true;
            this.operatorState.logs = [];
            
            const logBox = document.getElementById('logBox');
            if (logBox) {
                logBox.innerHTML = '';
            }
            
            const mode = document.getElementById('logMode')?.value || 'normal';
            const speed = parseInt(document.getElementById('logSpeed')?.value) || 500;
            const aiModel = document.getElementById('aiModel')?.value || 'lstm';
            
            // Set AI model
            if (this.ai) {
                this.ai.currentModel = aiModel;
            }
            
            // Start log generation
            this.logGenerationInterval = setInterval(async () => {
                if (!this.operatorState.isLogging) return;
                
                const logLine = this.generateRealisticLogLine(mode);
                await this.processLogLine(logLine);
                
            }, speed);
            
            // Update operator stats
            this.startOperatorStatsUpdate();
        }
        
        stopLiveLogs() {
            this.operatorState.isLogging = false;
            
            if (this.logGenerationInterval) {
                clearInterval(this.logGenerationInterval);
                this.logGenerationInterval = null;
            }
            
            if (this.statsUpdateInterval) {
                clearInterval(this.statsUpdateInterval);
                this.statsUpdateInterval = null;
            }
        }
        
        async processLogLine(logLine) {
            const timestamp = new Date().toISOString();
            const logEntry = { text: logLine, timestamp };
            
            this.operatorState.logs.push(logEntry);
            
            // AI Analysis
            let analysis = null;
            if (this.ai && this.operatorState.aiAnalysisEnabled) {
                analysis = await this.ai.analyzeLine(logLine);
            }
            
            // Display log line
            this.displayLogLine(logLine, analysis);
            
            // Update metrics
            this.updateOperatorMetrics(analysis);
            
            // Handle alerts
            if (analysis && (analysis.threat_level === 'HIGH' || analysis.threat_level === 'CRITICAL')) {
                this.handleOperatorAlert(logLine, analysis);
            }
        }
        
        displayLogLine(logLine, analysis) {
            const logBox = document.getElementById('logBox');
            if (!logBox) return;
            
            const logElement = document.createElement('div');
            logElement.className = 'log-line';
            
            if (analysis) {
                const threatClass = analysis.threat_level.toLowerCase();
                logElement.classList.add(threatClass);
                
                logElement.innerHTML = `
                    <div class="log-text">${this.escapeHtml(logLine)}</div>
                    <div class="log-analysis">
                        <span class="threat-level ${threatClass}">${analysis.threat_level}</span>
                        <span class="confidence">Conf: ${Math.round(analysis.confidence * 100)}%</span>
                        <span class="model">${analysis.model_used}</span>
                    </div>
                `;
            } else {
                logElement.innerHTML = `<div class="log-text">${this.escapeHtml(logLine)}</div>`;
            }
            
            logBox.appendChild(logElement);
            logBox.scrollTop = logBox.scrollHeight;
            
            // Limit displayed logs for performance
            const maxLogs = 100;
            while (logBox.children.length > maxLogs) {
                logBox.removeChild(logBox.firstChild);
            }
        }
        
        updateOperatorMetrics(analysis) {
            if (!analysis) return;
            
            // Update threat level meter
            const threatLevelFill = document.getElementById('threatLevelFill');
            const threatLevelText = document.getElementById('threatLevelText');
            
            if (threatLevelFill && threatLevelText) {
                const threatValue = this.getThreatLevelValue(analysis.threat_level);
                threatLevelFill.style.width = `${threatValue}%`;
                threatLevelText.textContent = analysis.threat_level;
            }
            
            // Update anomaly score
            const anomalyScoreFill = document.getElementById('anomalyScoreFill');
            const anomalyScoreText = document.getElementById('anomalyScoreText');
            
            if (anomalyScoreFill && anomalyScoreText) {
                const anomalyPercent = Math.round(analysis.anomaly_score * 100);
                anomalyScoreFill.style.width = `${anomalyPercent}%`;
                anomalyScoreText.textContent = (analysis.anomaly_score || 0).toFixed(2);
            }
            
            // Update stats
            if (analysis.threat_level !== 'NORMAL' && analysis.threat_level !== 'LOW') {
                this.stats.threatsDetected++;
                this.stats.alertsGenerated++;
                this.updateStatsDisplay();
            }
        }
        
        getThreatLevelValue(threatLevel) {
            const values = {
                'NORMAL': 10,
                'LOW': 25,
                'MEDIUM': 50,
                'HIGH': 75,
                'CRITICAL': 100
            };
            return values[threatLevel] || 10;
        }
        
        handleOperatorAlert(logLine, analysis) {
            const aiAlerts = document.getElementById('aiAlerts');
            if (!aiAlerts) return;
            
            const alertElement = document.createElement('div');
            alertElement.className = `ai-alert ${analysis.threat_level.toLowerCase()}`;
            alertElement.innerHTML = `
                <div class="alert-header">
                    <span class="alert-level">${analysis.threat_level}</span>
                    <span class="alert-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="alert-message">${analysis.insights[0] || 'Threat detected'}</div>
                <div class="alert-confidence">Confidence: ${Math.round(analysis.confidence * 100)}%</div>
            `;
            
            // Add to top of alerts
            aiAlerts.insertBefore(alertElement, aiAlerts.firstChild);
            
            // Limit number of alerts shown
            while (aiAlerts.children.length > 5) {
                aiAlerts.removeChild(aiAlerts.lastChild);
            }
            
            // Flash the alert
            alertElement.style.animation = 'flash 0.5s ease-in-out';
        }
        
        generateRealisticLogLine(mode) {
            const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
            
            const generators = {
                normal: () => this.generateNormalLogLine(timestamp),
                sneaky: () => Math.random() < 0.3 ? this.generateSneakyLogLine(timestamp) : this.generateNormalLogLine(timestamp),
                otp_steal: () => Math.random() < 0.4 ? this.generateOTPStealLogLine(timestamp) : this.generateNormalLogLine(timestamp),
                burst_attack: () => Math.random() < 0.7 ? this.generateBurstAttackLogLine(timestamp) : this.generateNormalLogLine(timestamp),
                advanced_evasion: () => Math.random() < 0.2 ? this.generateAdvancedEvasionLogLine(timestamp) : this.generateNormalLogLine(timestamp)
            };
            
            return generators[mode] ? generators[mode]() : generators.normal();
        }
        
        generateNormalLogLine(timestamp) {
            const templates = [
                `[INFO] ${timestamp} - BTS heartbeat: site-id=site-${this.randInt(101, 299)} status=OK`,
                `[NOTICE] ${timestamp} - HLR sync completed for subscriber +977-98${this.randDigits(8)}`,
                `[INFO] ${timestamp} - SMS delivery success: msg-id=${this.generateMsgId()}`,
                `[NOTICE] ${timestamp} - Roaming registration: IMSI=${this.generateIMSI()} from network=NTC`,
                `[INFO] ${timestamp} - Call setup completed: duration=${this.randInt(30, 600)}s`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        generateSneakyLogLine(timestamp) {
            const templates = [
                `[NOTICE] ${timestamp} - SendRoutingInfo request: subscriber=+977-98${this.randDigits(8)} from=/${this.generateSuspiciousIP()}`,
                `[WARNING] ${timestamp} - Unusual routing pattern detected: partner-id=${this.randInt(500, 999)}`,
                `[NOTICE] ${timestamp} - LocationQuery frequency elevated for region=rural-${this.randInt(1, 20)}`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        generateOTPStealLogLine(timestamp) {
            const templates = [
                `[ALERT] ${timestamp} - SMS redirect pattern: OTP msg duplicated for +977-98${this.randDigits(8)}`,
                `[CRITICAL] ${timestamp} - Potential OTP theft: SendRoutingInfo abuse detected`,
                `[ALERT] ${timestamp} - Banking SMS intercepted: unauthorized routing to /${this.generateSuspiciousIP()}`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        generateBurstAttackLogLine(timestamp) {
            const templates = [
                `[CRITICAL] ${timestamp} - DoS attack: message flooding from /${this.generateAttackerIP()}`,
                `[ALERT] ${timestamp} - Resource exhaustion: connection pool at 95% capacity`,
                `[CRITICAL] ${timestamp} - Malformed SS7 messages: protocol violation detected`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        generateAdvancedEvasionLogLine(timestamp) {
            const templates = [
                `[WARNING] ${timestamp} - APT indicator: low-rate persistent queries detected`,
                `[NOTICE] ${timestamp} - Stealth probing: legitimate-looking traffic with hidden payload`,
                `[WARNING] ${timestamp} - Advanced evasion: polymorphic attack signature detected`
            ];
            
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        generateSuspiciousIP() {
            const suspiciousRanges = ['185.', '79.', '46.', '91.'];
            const range = suspiciousRanges[Math.floor(Math.random() * suspiciousRanges.length)];
            return `${range}${this.randInt(1, 254)}.${this.randInt(1, 254)}.${this.randInt(1, 254)}`;
        }
        
        generateAttackerIP() {
            // Generate known malicious IP ranges
            const maliciousRanges = ['45.', '103.', '185.', '194.'];
            const range = maliciousRanges[Math.floor(Math.random() * maliciousRanges.length)];
            return `${range}${this.randInt(1, 254)}.${this.randInt(1, 254)}.${this.randInt(1, 254)}`;
        }
        
        generateMsgId() {
            return `msg-${Date.now()}-${this.randInt(1000, 9999)}`;
        }
        
        generateIMSI() {
            return `42902${this.randDigits(10)}`;
        }
        
        async generateAttackBurst() {
            const burstSize = 15;
            const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
            
            for (let i = 0; i < burstSize; i++) {
                const attackType = Math.random();
                let logLine;
                
                if (attackType < 0.4) {
                    logLine = this.generateOTPStealLogLine(timestamp);
                } else if (attackType < 0.7) {
                    logLine = this.generateBurstAttackLogLine(timestamp);
                } else {
                    logLine = this.generateSneakyLogLine(timestamp);
                }
                
                await this.processLogLine(logLine);
                await this.delay(50); // Quick burst
            }
        }
        
        async runDeepAnalysis() {
            if (!this.ai || this.operatorState.logs.length === 0) {
                alert('No logs available for analysis or AI engine not available.');
                return;
            }
            
            // Show loading state
            const analysisButton = document.getElementById('runDeepAnalysis');
            const originalText = analysisButton.textContent;
            analysisButton.textContent = 'Analyzing...';
            analysisButton.disabled = true;
            
            try {
                // Run batch analysis
                const batchResult = await this.ai.analyzeBatch(this.operatorState.logs.slice(-100));
                
                // Display results
                this.displayDeepAnalysisResults(batchResult);
                
            } catch (error) {
                console.error('Deep analysis failed:', error);
                alert('Analysis failed: ' + error.message);
            } finally {
                // Restore button
                analysisButton.textContent = originalText;
                analysisButton.disabled = false;
            }
        }
        
        displayDeepAnalysisResults(batchResult) {
            const { results, summary } = batchResult;
            
            // Clear current logs and show analyzed results
            const logBox = document.getElementById('logBox');
            if (logBox) {
                logBox.innerHTML = '';
                
                // Add summary header
                const summaryElement = document.createElement('div');
                summaryElement.className = 'analysis-summary';
                summaryElement.innerHTML = `
                    <h4>🤖 Deep Analysis Results</h4>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="stat-value">${summary.total_lines}</span>
                            <span class="stat-label">Lines Analyzed</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${summary.total_threats}</span>
                            <span class="stat-label">Threats Found</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${Math.round(summary.average_confidence * 100)}%</span>
                            <span class="stat-label">Avg Confidence</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${Math.round(summary.threat_percentage)}%</span>
                            <span class="stat-label">Threat Rate</span>
                        </div>
                    </div>
                    <div class="recommendation">
                        <strong>Recommendation:</strong> ${summary.recommendation}
                    </div>
                `;
                logBox.appendChild(summaryElement);
                
                // Add analyzed logs
                results.forEach(result => {
                    this.displayLogLine(result.original_line, result);
                });
            }
        }
        
        clearLogs() {
            const logBox = document.getElementById('logBox');
            if (logBox) {
                logBox.innerHTML = '';
            }
            this.operatorState.logs = [];
        }
        
        exportLogs() {
            if (this.operatorState.logs.length === 0) {
                alert('No logs to export.');
                return;
            }
            
            const exportData = {
                timestamp: new Date().toISOString(),
                total_logs: this.operatorState.logs.length,
                ai_model: this.ai ? this.ai.currentModel : 'none',
                logs: this.operatorState.logs.map(log => ({
                    timestamp: log.timestamp,
                    text: log.text
                }))
            };
            
            this.downloadFile(JSON.stringify(exportData, null, 2), 'ss7-network-logs.json');
        }
        
        startOperatorStatsUpdate() {
            this.statsUpdateInterval = setInterval(() => {
                // Update dynamic stats displays
                const threatsBlocked = document.getElementById('threatsBlocked');
                const alertsGenerated = document.getElementById('alertsGenerated');
                const aiAccuracy = document.getElementById('aiAccuracy');
                
                if (threatsBlocked) {
                    threatsBlocked.textContent = this.stats.threatsDetected;
                }
                if (alertsGenerated) {
                    alertsGenerated.textContent = this.stats.alertsGenerated;
                }
                if (aiAccuracy) {
                    // Simulate slight accuracy variations
                    const accuracy = this.stats.aiAccuracy + (Math.random() - 0.5) * 0.2;
                    aiAccuracy.textContent = `${accuracy.toFixed(1)}%`;
                }
            }, 2000);
        }
        
        setAIModel(modelType) {
            if (this.ai) {
                this.ai.currentModel = modelType;
                console.log(`🤖 Switched to ${modelType} model`);
            }
        }
        
        /* ==================== TRAINING METHODS ==================== */
        
        async startModelTraining() {
            if (!this.ai) {
                alert('AI engine not available for training.');
                return;
            }
            
            const modelType = document.getElementById('modelType')?.value || 'lstm';
            const epochs = parseInt(document.getElementById('epochs')?.value) || 50;
            const learningRate = parseFloat(document.getElementById('learningRate')?.value) || 0.001;
            const batchSize = parseInt(document.getElementById('batchSize')?.value) || 32;
            
            const config = {
                modelType,
                epochs,
                learningRate,
                batchSize
            };
            
            // Show training progress
            this.showTrainingProgress();
            
            try {
                // Generate synthetic training data
                const trainingData = this.ai.generateSyntheticTrainingData(1000);
                
                // Start training
                const result = await this.ai.trainModel(trainingData, config);
                
                // Update model metrics
                this.updateModelPerformanceDisplay(result);
                
                console.log('✅ Model training completed:', result);
                
            } catch (error) {
                console.error('❌ Training failed:', error);
                alert('Training failed: ' + error.message);
            } finally {
                this.hideTrainingProgress();
            }
        }
        
        stopModelTraining() {
            // In a real implementation, this would stop the training process
            if (this.ai) {
                this.ai.isTraining = false;
            }
            this.hideTrainingProgress();
        }
        
        showTrainingProgress() {
            const trainingProgress = document.getElementById('trainingProgress');
            if (trainingProgress) {
                trainingProgress.style.display = 'block';
            }
        }
        
        hideTrainingProgress() {
            const trainingProgress = document.getElementById('trainingProgress');
            if (trainingProgress) {
                trainingProgress.style.display = 'none';
            }
        }
        
        updateTrainingProgress(progressData) {
            const currentEpoch = document.getElementById('currentEpoch');
            const totalEpochs = document.getElementById('totalEpochs');
            const trainingAccuracy = document.getElementById('trainingAccuracy');
            const trainingLoss = document.getElementById('trainingLoss');
            const trainingProgressBar = document.getElementById('trainingProgressBar');
            
            if (currentEpoch) currentEpoch.textContent = progressData.epoch;
            if (totalEpochs) totalEpochs.textContent = progressData.total_epochs;
            if (trainingAccuracy) trainingAccuracy.textContent = `${Math.round(progressData.accuracy * 100)}%`;
            if (trainingLoss) trainingLoss.textContent = progressData.loss.toFixed(4);
            if (trainingProgressBar) {
                trainingProgressBar.style.width = `${progressData.progress * 100}%`;
            }
        }
        
        updateModelMetrics(metrics) {
            // Update model performance cards
            const accuracy = document.getElementById('accuracy');
            const precision = document.getElementById('precision');
            const recall = document.getElementById('recall');
            const f1Score = document.getElementById('f1Score');
            
            if (accuracy) accuracy.textContent = `${Math.round(metrics.accuracy * 100)}%`;
            if (precision) precision.textContent = `${Math.round(metrics.precision * 100)}%`;
            if (recall) recall.textContent = `${Math.round(metrics.recall * 100)}%`;
            if (f1Score) f1Score.textContent = `${Math.round(metrics.f1Score * 100)}%`;
        }
        
        updateModelPerformanceDisplay(result) {
            const model = this.ai.models[result.model.toLowerCase()];
            if (model) {
                this.updateModelMetrics({
                    accuracy: model.accuracy,
                    precision: model.precision,
                    recall: model.recall,
                    f1Score: model.f1Score
                });
            }
        }
        
        updateTrainingStatus(status) {
            console.log('🎯 Training Status:', status);
            // Could show status in UI if needed
        }
        
        saveModel() {
            if (!this.ai) {
                alert('No AI model available to save.');
                return;
            }
            
            const modelData = {
                timestamp: new Date().toISOString(),
                model_type: this.ai.currentModel,
                performance: {
                    accuracy: this.ai.models[this.ai.currentModel].accuracy,
                    precision: this.ai.models[this.ai.currentModel].precision,
                    recall: this.ai.models[this.ai.currentModel].recall,
                    f1Score: this.ai.models[this.ai.currentModel].f1Score
                },
                // In a real implementation, would include actual model weights
                weights_summary: 'Model weights saved (demo version)'
            };
            
            this.downloadFile(JSON.stringify(modelData, null, 2), 'ss7-ai-model.json');
        }
        
        loadModel() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const modelData = JSON.parse(text);
                    
                    if (this.ai && modelData.model_type) {
                        // In a real implementation, would load actual weights
                        console.log('📥 Loading model:', modelData);
                        alert(`Model loaded: ${modelData.model_type} (Demo: weights not actually loaded)`);
                    }
                } catch (error) {
                    alert('Failed to load model: ' + error.message);
                }
            };
            
            input.click();
        }
        
        /* ==================== AI EVENT HANDLERS ==================== */
        
        handleAIThreatDetection(threat) {
            console.log('🚨 AI Threat Detected:', threat);
            this.stats.threatsDetected++;
            this.stats.alertsGenerated++;
            this.updateStatsDisplay();
        }
        
        handleAIAnomalyDetection(anomaly) {
            console.log('⚠️ AI Anomaly Detected:', anomaly);
            this.stats.alertsGenerated++;
            this.updateStatsDisplay();
        }
        
        /* ==================== UTILITY METHODS ==================== */
        
        showSection(sectionName) {
            // Hide all sections
            const sections = ['simulation', 'quiz', 'results', 'operator', 'training'];
            sections.forEach(name => {
                const section = document.getElementById(name);
                if (section) {
                    section.classList.add('hidden');
                }
            });
            
            // Show target section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                this.currentSection = sectionName;
                
                // Smooth scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Section-specific initialization
                if (sectionName === 'quiz') {
                    this.loadEnhancedQuiz();
                } else if (sectionName === 'training') {
                    this.hideTrainingProgress();
                }
            }
        }
        
        updateStatsDisplay() {
            const threatsDetectedEl = document.getElementById('threatsDetected');
            const simulationsRunEl = document.getElementById('simulationsRun');
            
            if (threatsDetectedEl) {
                this.animateNumber(threatsDetectedEl, this.stats.threatsDetected);
            }
            
            if (simulationsRunEl) {
                this.animateNumber(simulationsRunEl, this.stats.simulationsRun);
            }
        }
        
        animateNumber(element, targetValue) {
            const currentValue = parseInt(element.textContent) || 0;
            const increment = Math.ceil((targetValue - currentValue) / 10);
            
            if (currentValue < targetValue) {
                element.textContent = Math.min(currentValue + increment, targetValue);
                setTimeout(() => this.animateNumber(element, targetValue), 50);
            }
        }
        
        setLanguage(langCode) {
            this.currentLang = langCode;
            
            // Update UI text based on language
            const translations = this.translations[langCode] || this.translations.en;
            
            // Update key elements
            Object.entries(translations).forEach(([key, value]) => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = value;
                }
            });
            
            console.log(`🌐 Language changed to: ${langCode}`);
        }
        
        initializeTranslations() {
            return {
                en: {
                    heroTitle: 'Advanced SS7 Threat Detection for Rural Nepal',
                    heroText: 'Our AI-enhanced system demonstrates SS7 vulnerabilities using machine learning to detect patterns in real-time. Experience how attackers exploit legacy telecom protocols and learn to protect your community with intelligent monitoring.',
                    simTitle: 'AI-Enhanced SS7 Attack Simulation',
                    simDesc: 'Real-time AI analysis of SS7 attack patterns with machine learning threat detection.',
                    quizTitle: 'AI-Powered Risk Assessment',
                    quizIntro: 'Personalized security assessment using machine learning algorithms.'
                },
                ne: {
                    heroTitle: 'ग्रामीण नेपालको लागि उन्नत SS7 खतरा पत्ता लगाउने',
                    heroText: 'हाम्रो AI-संवर्धित प्रणालीले मेसिन लर्निङ प्रयोग गरेर वास्तविक समयमा ढाँचाहरू पत्ता लगाउन SS7 कमजोरीहरू प्रदर्शन गर्दछ।',
                    simTitle: 'AI-संवर्धित SS7 आक्रमण सिमुलेशन',
                    simDesc: 'मेसिन लर्निङ खतरा पत्ता लगाउने साथ SS7 आक्रमण ढाँचाहरूको वास्तविक समय AI विश्लेषण।',
                    quizTitle: 'AI-संचालित जोखिम मूल्याङ्कन',
                    quizIntro: 'मेसिन लर्निङ एल्गोरिदमहरू प्रयोग गरी व्यक्तिगत सुरक्षा मूल्याङ्कन।'
                }
            };
        }
        
        downloadReport() {
            // Generate comprehensive report
            const report = {
                timestamp: new Date().toISOString(),
                user_profile: {
                    quiz_score: this.quizState.lastScore || 0,
                    risk_level: this.quizState.lastRiskLevel || 'Unknown',
                    simulations_completed: this.stats.simulationsRun
                },
                threat_analysis: {
                    total_threats_detected: this.stats.threatsDetected,
                    ai_accuracy: this.stats.aiAccuracy,
                    alerts_generated: this.stats.alertsGenerated
                },
                recommendations: this.generatePersonalizedRecommendations(),
                ai_insights: this.generateAIInsights()
            };
            
            this.downloadFile(JSON.stringify(report, null, 2), 'ss7-security-report.json');
        }
        
        shareResults() {
            if (navigator.share) {
                navigator.share({
                    title: 'SS7 Security Assessment Results',
                    text: `I completed an AI-powered SS7 security assessment. Threats detected: ${this.stats.threatsDetected}, Simulations run: ${this.stats.simulationsRun}`,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback: copy to clipboard
                const shareText = `SS7 Security Assessment Results:
    - Threats detected: ${this.stats.threatsDetected}
    - Simulations completed: ${this.stats.simulationsRun}
    - AI Accuracy: ${this.stats.aiAccuracy}%

    Generated by SS7 AI Guardian - Advanced threat detection for mobile security`;
                
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Results copied to clipboard!');
                }).catch(() => {
                    alert('Unable to share results. Please copy the URL manually.');
                });
            }
        }
        
        generatePersonalizedRecommendations() {
            const recommendations = [
                'Enable two-factor authentication using authenticator apps instead of SMS',
                'Monitor your mobile bills for unusual activity',
                'Report suspicious phone behavior to your mobile operator',
                'Keep your mobile software updated',
                'Be cautious of unexpected calls asking for personal information'
            ];
            
            // Customize based on user's quiz performance and simulation results
            if (this.stats.threatsDetected > 5) {
                recommendations.unshift('Your simulation results indicate high threat exposure. Consider additional security measures.');
            }
            
            if (this.quizState.lastRiskLevel === 'High' || this.quizState.lastRiskLevel === 'Critical') {
                recommendations.unshift('PRIORITY: Improve your security awareness through additional training.');
            }
            
            return recommendations;
        }
        
        generateAIInsights() {
            return [
                `AI models analyzed ${this.operatorState.logs.length} network logs`,
                `Threat detection accuracy: ${this.stats.aiAccuracy}%`,
                `Most common threat type: OTP interception (based on simulation data)`,
                `Recommended AI model for rural Nepal: LSTM Neural Network`,
                `Confidence threshold for alerts: 75%+`
            ];
        }
        
        downloadFile(content, filename) {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        randInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        randDigits(count) {
            let result = '';
            for (let i = 0; i < count; i++) {
                result += Math.floor(Math.random() * 10);
            }
            return result;
        }
    }

    // Additional CSS animations and styles for enhanced features
    const additionalStyles = `
    <style>
    .ai-step-info {
        display: flex;
        gap: 12px;
        margin-top: 8px;
    }

    .threat-level {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .threat-level.normal { background: rgba(16,185,129,0.2); color: var(--success); }
    .threat-level.low { background: rgba(245,158,11,0.2); color: var(--warning); }
    .threat-level.medium { background: rgba(245,158,11,0.3); color: var(--warning); }
    .threat-level.high { background: rgba(239,68,68,0.2); color: var(--danger); }
    .threat-level.critical { background: rgba(239,68,68,0.3); color: var(--danger); }

    .confidence {
        font-size: 11px;
        color: var(--muted);
    }

    .ai-analysis-header {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
    }

    .threat-badge {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
    }

    .confidence-badge {
        font-size: 12px;
        color: var(--muted);
    }

    .ai-insights-list {
        margin: 0;
        padding-left: 20px;
    }

    .ai-insights-list li {
        margin-bottom: 6px;
        color: var(--muted);
        font-size: 14px;
    }

    .ai-model-info {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.05);
    }

    .difficulty {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .difficulty.beginner { background: rgba(16,185,129,0.2); color: var(--success); }
    .difficulty.intermediate { background: rgba(245,158,11,0.2); color: var(--warning); }
    .difficulty.advanced { background: rgba(239,68,68,0.2); color: var(--danger); }

    .category {
        font-size: 10px;
        color: var(--muted);
        text-transform: capitalize;
    }

    .q-metadata {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }

    .option-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
    }

    .option-label:hover {
        background: rgba(255,255,255,0.04);
        border-color: var(--accent);
    }

    .option-label input[type="radio"] {
        margin: 0;
    }

    .option-text {
        flex: 1;
        font-size: 14px;
    }

    .log-analysis {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 4px;
        font-size: 11px;
    }

    .log-text {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.4;
    }

    .analysis-summary {
        background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05));
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(16,185,129,0.2);
        margin-bottom: 16px;
    }

    .summary-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin: 12px 0;
    }

    .summary-stats .stat {
        text-align: center;
    }

    .summary-stats .stat-value {
        display: block;
        font-size: 20px;
        font-weight: 800;
        color: var(--accent);
    }

    .summary-stats .stat-label {
        font-size: 11px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .recommendation {
        margin-top: 12px;
        padding: 8px 12px;
        background: rgba(245,158,11,0.1);
        border-left: 3px solid var(--warning);
        border-radius: 0 8px 8px 0;
    }

    .ai-alert {
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 8px;
        border-left: 4px solid;
    }

    .ai-alert.high { 
        background: rgba(239,68,68,0.05); 
        border-left-color: var(--danger); 
    }

    .ai-alert.critical { 
        background: rgba(239,68,68,0.1); 
        border-left-color: var(--danger); 
    }

    .ai-alert.medium { 
        background: rgba(245,158,11,0.05); 
        border-left-color: var(--warning); 
    }

    .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .alert-level {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .alert-time {
        font-size: 11px;
        color: var(--muted);
    }

    .alert-message {
        font-size: 13px;
        margin-bottom: 4px;
    }

    .alert-confidence {
        font-size: 11px;
        color: var(--muted);
    }

    .threat-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .threat-item {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .threat-name {
        font-size: 12px;
        min-width: 100px;
    }

    .threat-bar {
        flex: 1;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        overflow: hidden;
    }

    .threat-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success), var(--warning), var(--danger));
        border-radius: 3px;
        transition: width 0.5s ease;
    }

    .threat-value {
        font-size: 11px;
        color: var(--muted);
        min-width: 35px;
        text-align: right;
    }

    @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    /* Responsive improvements */
    @media (max-width: 768px) {
        .control-grid {
            grid-template-columns: 1fr;
        }
        
        .summary-stats {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .cta-row {
            flex-direction: column;
            gap: 8px;
        }
        
        .option-label {
            min-width: auto;
        }
        
        .q-options {
            flex-direction: column;
        }
    }
    </style>
    `;

    // Initialize the enhanced application
    document.addEventListener('DOMContentLoaded', () => {
        // Inject additional styles
        document.head.insertAdjacentHTML('beforeend', additionalStyles);
        
        // Initialize the application
        window.SS7App = new SS7EnhancedApp();
    });

    // Export for potential external use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SS7EnhancedApp;
    }    initializeSimulation() {
            this.simulationState.steps = this.buildScenarioSteps('normal', 5);
            this.simulationState.stepIndex = 0;
            this.resetSVGAnimations();
        }
        
        async runScenario() {
            const scenario = document.getElementById('simScenario')?.value || 'normal';
            const intensity = document.getElementById('simIntensity')?.value || 5;
            const aiMode = document.getElementById('aiMode')?.value || 'realtime';
            
            this.simulationState.isRunning = true;
            this.simulationState.currentScenario = scenario;
            this.stats.simulationsRun++;
            this.updateStatsDisplay();
            
            // Build scenario steps with AI enhancements
            this.simulationState.steps = await this.buildEnhancedScenarioSteps(scenario, intensity, aiMode);
            this.renderTimeline(this.simulationState.steps);
            
            // Reset animation state
            this.resetSVGAnimations();
            this.simulationState.stepIndex = 0;
            
            // Update AI confidence display
            this.updateAIConfidence(0);
            
            // Enable next step button
            document.getElementById('nextStep').disabled = false;
            
            // Auto-play simulation
            await this.autoPlaySimulation(intensity);
        }
        
        async buildEnhancedScenarioSteps(scenario, intensity, aiMode) {
            const baseSteps = this.buildScenarioSteps(scenario, intensity);
            
            // Enhance with AI analysis
            if (this.ai) {
                for (let step of baseSteps) {
                    // Generate AI insights for each step
                    const mockLogLine = this.generateStepLogLine(step, scenario);
                    const analysis = await this.ai.analyzeLine(mockLogLine);
                    
                    step.aiAnalysis = analysis;
                    step.confidence = analysis.confidence;
                    step.threatLevel = analysis.threat_level;
                    step.insights = analysis.insights;
                }
            }
            
            return baseSteps;
        }
        
        buildScenarioSteps(scenario, intensity) {
            const intensityNum = Number(intensity) || 5;
            
            const scenarios = {
                normal: [
                    {
                        step: 1,
                        title: "Network Registration",
                        description: "Mobile device registers with local BTS tower. Standard HLR authentication.",
                        duration: 1000
                    },
                    {
                        step: 2,
                        title: "SMS Routing",
                        description: "SMS message routed through normal SS7 path. No anomalies detected.",
                        duration: 800
                    },
                    {
                        step: 3,
                        title: "Call Setup Complete",
                        description: "Voice call established using standard signaling protocols.",
                        duration: 600
                    }
                ],
                
                probing: [
                    {
                        step: 1,
                        title: "Reconnaissance Begins",
                        description: "Attacker sends multiple SendRoutingInfo queries to map network topology.",
                        duration: 1200
                    },
                    {
                        step: 2,
                        title: "Location Probing",
                        description: "Systematic location queries attempt to track subscriber movements.",
                        duration: 1000
                    },
                    {
                        step: 3,
                        title: "Network Mapping",
                        description: "Attacker builds comprehensive map of network vulnerabilities.",
                        duration: 1500
                    }
                ],
                
                otp_theft: [
                    {
                        step: 1,
                        title: "Target Identification",
                        description: "Attacker identifies high-value target through network reconnaissance.",
                        duration: 800
                    },
                    {
                        step: 2,
                        title: "SMS Interception Setup",
                        description: "Malicious SS7 commands redirect SMS traffic to attacker-controlled number.",
                        duration: 1200
                    },
                    {
                        step: 3,
                        title: "OTP Theft Execution",
                        description: "Banking OTP intercepted and used for unauthorized transaction.",
                        duration: 1000
                    },
                    {
                        step: 4,
                        title: "Fraud Completion",
                        description: "Attacker successfully authenticates using stolen OTP.",
                        duration: 600
                    }
                ],
                
                location_track: [
                    {
                        step: 1,
                        title: "Target Selection",
                        description: "Attacker selects target subscriber for location surveillance.",
                        duration: 600
                    },
                    {
                        step: 2,
                        title: "Location Requests",
                        description: "Periodic UpdateLocation and routing queries track target movement.",
                        duration: 1500
                    },
                    {
                        step: 3,
                        title: "Movement Mapping",
                        description: "Real-time location data compiled into movement patterns.",
                        duration: 1200
                    }
                ],
                
                call_redirect: [
                    {
                        step: 1,
                        title: "Call Interception Setup",
                        description: "Attacker configures SS7 call forwarding to redirect incoming calls.",
                        duration: 1000
                    },
                    {
                        step: 2,
                        title: "Call Redirection Active",
                        description: "Victim's calls secretly forwarded to attacker's monitoring system.",
                        duration: 1500
                    },
                    {
                        step: 3,
                        title: "Conversation Monitoring",
                        description: "Attacker monitors private conversations in real-time.",
                        duration: 2000
                    }
                ],
                
                dos_attack: [
                    {
                        step: 1,
                        title: "Attack Preparation",
                        description: "Attacker assembles botnet of compromised SS7 access points.",
                        duration: 800
                    },
                    {
                        step: 2,
                        title: "Message Flooding",
                        description: "Massive volume of malformed SS7 messages overwhelm network resources.",
                        duration: 2000
                    },
                    {
                        step: 3,
                        title: "Service Disruption",
                        description: "Network services degraded or completely unavailable to legitimate users.",
                        duration: 1500
                    }
                ],
                
                advanced_persistent: [
                    {
                        step: 1,
                        title: "Stealth Infiltration",
                        description: "Advanced persistent threat establishes covert access to SS7 infrastructure.",
                        duration: 1500
                    },
                    {
                        step: 2,
                        title: "Long-term Monitoring",
                        description: "Threat actor maintains persistent surveillance of target communications.",
                        duration: 2500
                    },
                    {
                        step: 3,
                        title: "Data Exfiltration",
                        description: "Systematic extraction of sensitive communication metadata.",
                        duration: 2000
                    },
                    {
                        step: 4,
                        title: "Covering Tracks",
                        description: "Evidence of intrusion carefully concealed to avoid detection.",
                        duration: 1000
                    }
                ]
            };
            
            const steps = scenarios[scenario] || scenarios.normal;
            
            // Adjust timing based on intensity
            return steps.map(step => ({
                ...step,
                duration: Math.max(step.duration * (11 - intensityNum) / 10, 300)
            }));
        }
        
        generateStepLogLine(step, scenario) {
            const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
            
            const logTemplates = {
                normal: `[INFO] ${timestamp} - ${step.title}: Normal network operation`,
                probing: `[NOTICE] ${timestamp} - SendRoutingInfo request pattern detected for ${step.title}`,
                otp_theft: `[ALERT] ${timestamp} - Potential OTP theft: ${step.description}`,
                location_track: `[WARNING] ${timestamp} - Location tracking activity: ${step.title}`,
                call_redirect: `[ALERT] ${timestamp} - Call forwarding anomaly: ${step.description}`,
                dos_attack: `[CRITICAL] ${timestamp} - DoS attack pattern: ${step.title}`,
                advanced_persistent: `[WARNING] ${timestamp} - APT activity: ${step.description}`
            };
            
            return logTemplates[scenario] || logTemplates.normal;
        }
        
        async autoPlaySimulation(intensity) {
            const steps = this.simulationState.steps;
            
            for (let i = 0; i < steps.length && this.simulationState.isRunning; i++) {
                this.simulationState.stepIndex = i;
                
                // Update timeline highlight
                this.highlightTimelineStep(i);
                
                // Update AI confidence based on step analysis
                if (steps[i].aiAnalysis) {
                    this.updateAIConfidence(steps[i].aiAnalysis.confidence);
                    this.updateAIInsights(steps[i].aiAnalysis);
                }
                
                // Run step animation
                await this.animateScenarioStep(i, this.simulationState.currentScenario);
                
                // Wait for step duration
                await this.delay(steps[i].duration);
                
                // Update threat detection stats
                if (steps[i].threatLevel && steps[i].threatLevel !== 'NORMAL') {
                    this.stats.threatsDetected++;
                    this.updateStatsDisplay();
                }
            }
            
            // Disable next step button when complete
            document.getElementById('nextStep').disabled = true;
        }
        
        async animateScenarioStep(stepIndex, scenario) {
            const svg = document.getElementById('simSVG');
            if (!svg) return;
            
            const victim = document.getElementById('victim');
            const attacker = document.getElementById('attacker');
            const routeLine = document.getElementById('routeLine');
            const otpBubble = document.getElementById('otpBubble');
            const threatIndicators = document.getElementById('threatIndicators');
            
            switch (stepIndex) {
                case 0:
                    // Initial connection/reconnaissance
                    if (routeLine) {
                        routeLine.style.opacity = '1';
                        this.animatePathDraw(routeLine);
                    }
                    break;
                    
                case 1:
                    // Network response or continued attack
                    if (victim) {
                        this.pulseElement(victim, scenario === 'normal' ? '#10b981' : '#f59e0b');
                    }
                    
                    if (scenario !== 'normal' && threatIndicators) {
                        threatIndicators.style.opacity = '0.8';
                    }
                    break;
                    
                case 2:
                    // Action completion or data theft
                    if (scenario.includes('otp') || scenario.includes('theft')) {
                        if (otpBubble) {
                            otpBubble.style.opacity = '1';
                            await this.animateElementMovement(otpBubble, 
                                { cx: 260, cy: 190 }, 
                                { cx: 500, cy: 100 }, 
                                1000
                            );
                            setTimeout(() => otpBubble.style.opacity = '0', 1200);
                        }
                    }
                    
                    if (attacker && scenario !== 'normal') {
                        this.pulseElement(attacker, '#ef4444');
                    }
                    break;
                    
                case 3:
                    // Advanced scenarios final step
                    if (scenario === 'advanced_persistent') {
                        // Simulate covering tracks
                        if (routeLine) routeLine.style.opacity = '0.3';
                        if (threatIndicators) threatIndicators.style.opacity = '0.2';
                    }
                    break;
            }
        }
        
        animatePathDraw(pathElement) {
            const length = pathElement.getTotalLength();
            pathElement.style.strokeDasharray = `${length} ${length}`;
            pathElement.style.strokeDashoffset = length;
            pathElement.animate([
                { strokeDashoffset: length },
                { strokeDashoffset: 0 }
            ], {
                duration: 800,
                fill: 'forwards',
                easing: 'ease-in-out'
            });
        }
        
        pulseElement(element, color = '#06b6d4') {
            element.animate([
                { transform: 'scale(1)', fill: element.getAttribute('fill') },
                { transform: 'scale(1.4)', fill: color },
                { transform: 'scale(1)', fill: element.getAttribute('fill') }
            ], {
                duration: 600,
                easing: 'ease-in-out'
            });
        }
        
        async animateElementMovement(element, from, to, duration) {
            const animation = element.animate([
                { cx: from.cx, cy: from.cy },
                { cx: to.cx, cy: to.cy }
            ], {
                duration: duration,
                fill: 'forwards',
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            return new Promise(resolve => {
                animation.onfinish = resolve;
            });
        }
        
        stopScenario() {
            this.simulationState.isRunning = false;
            document.getElementById('nextStep').disabled = true;
        }
        
        nextSimulationStep() {
            if (this.simulationState.stepIndex < this.simulationState.steps.length) {
                const step = this.simulationState.steps[this.simulationState.stepIndex];
                
                this.highlightTimelineStep(this.simulationState.stepIndex);
                this.animateScenarioStep(this.simulationState.stepIndex, this.simulationState.currentScenario);
                
                if (step.aiAnalysis) {
                    this.updateAIConfidence(step.aiAnalysis.confidence);
                    this.updateAIInsights(step.aiAnalysis);
                }
                
                this.simulationState.stepIndex++;
                
                if (this.simulationState.stepIndex >= this.simulationState.steps.length) {
                    document.getElementById('nextStep').disabled = true;
                }
            }
        }
        
        restartSimulation() {
            this.simulationState.stepIndex = 0;
            this.resetSVGAnimations();
            this.highlightTimelineStep(0);
            this.updateAIConfidence(0);
            document.getElementById('nextStep').disabled = false;
            
            const aiInsights = document.getElementById('aiInsightContent');
            if (aiInsights) {
                aiInsights.innerHTML = '<p class="muted">Run a simulation to see AI-powered threat analysis...</p>';
            }
        }
        
        resetSVGAnimations() {
            const routeLine = document.getElementById('routeLine');
            const otpBubble = document.getElementById('otpBubble');
            const threatIndicators = document.getElementById('threatIndicators');
            
            if (routeLine) {
                routeLine.style.opacity = '0';
                routeLine.style.strokeDasharray = 'none';
                routeLine.style.strokeDashoffset = '0';
            }
            
            if (otpBubble) {
                otpBubble.style.opacity = '0';
                otpBubble.setAttribute('cx', '260');
                otpBubble.setAttribute('cy', '190');
            }
            
            if (threatIndicators) {
                threatIndicators.style.opacity = '0';
            }
        }
        
        renderTimeline(steps) {
            const timeline = document.getElementById('timeline');
            if (!timeline) return;
            
            timeline.innerHTML = '';
            
            steps.forEach((step, index) => {
                const stepElement = document.createElement('div');
                stepElement.className = 'sim-step hover-lift';
                stepElement.innerHTML = `
                    <div class="num">${step.step}</div>
                    <div>
                        <h4>${this.escapeHtml(step.title)}</h4>
                        <p>${this.escapeHtml(step.description)}</p>
                        ${step.aiAnalysis ? `
                            <div class="ai-step-info">
                                <small class="threat-level ${step.threatLevel?.toLowerCase()}">${step.threatLevel}</small>
                                <small class="confidence">Confidence: ${Math.round(step.confidence * 100)}%</small>
                            </div>
                        ` : ''}
                    </div>
                `;
                timeline.appendChild(stepElement);
            });
            
            this.highlightTimelineStep(0);
        }
        
        highlightTimelineStep(index) {
            const steps = document.querySelectorAll('.sim-step');
            steps.forEach((step, i) => {
                step.style.opacity = i === index ? '1' : '0.6';
                step.style.transform = i === index ? 'scale(1.02)' : 'scale(1)';
            });
        }
        
        updateAIConfidence(confidence) {
            const confidenceFill = document.getElementById('confidenceFill');
            const confidenceText = document.getElementById('confidenceText');
            
            if (confidenceFill) {
                confidenceFill.style.width = `${confidence * 100}%`;
            }
            
            if (confidenceText) {
                confidenceText.textContent = `${Math.round(confidence * 100)}%`;
            }
        }
        
        updateAIInsights(analysis) {
            const aiInsightContent = document.getElementById('aiInsightContent');
            if (!aiInsightContent) return;
            
            const insights = analysis.insights || [];
            const threatLevel = analysis.threat_level || 'NORMAL';
            const confidence = analysis.confidence || 0;
            
            aiInsightContent.innerHTML = `
                <div class="ai-analysis-header">
                    <span class="threat-badge ${threatLevel.toLowerCase()}">${threatLevel}</span>
                    <span class="confidence-badge">Confidence: ${Math.round(confidence * 100)}%</span>
                </div>
                <ul class="ai-insights-list">
                    ${insights.map(insight => `<li>${this.escapeHtml(insight)}</li>`).join('')}
                </ul>
                <div class="ai-model-info">
                    <small class="muted">Analysis by: ${analysis.model_used || 'LSTM'} Neural Network</small>
                </div>
            `;
        }
        
        async generateAIReport() {
            if (!this.ai || !this.simulationState.steps.length) {
                alert('No simulation data available for report generation.');
                return;
            }
            
            const report = {
                timestamp: new Date().toISOString(),
                scenario: this.simulationState.currentScenario,
                steps_analyzed: this.simulationState.steps.length,
                threat_summary: this.generateThreatSummary(),
                recommendations: this.generateRecommendations(),
                ai_model: this.ai.currentModel
            };
            
            this.downloadFile(JSON.stringify(report, null, 2), 'ss7-ai-analysis-report.json');
        }
        
        generateThreatSummary() {
            const steps = this.simulationState.steps;
            const threatCounts = {
                CRITICAL: 0,
                HIGH: 0,
                MEDIUM: 0,
                LOW: 0,
                NORMAL: 0
            };
            
            let totalConfidence = 0;
            
            steps.forEach(step => {
                if (step.aiAnalysis) {
                    threatCounts[step.aiAnalysis.threat_level]++;
                    totalConfidence += step.aiAnalysis.confidence;
                }
            });
            
            return {
                threat_distribution: threatCounts,
                average_confidence: totalConfidence / steps.length,
                highest_threat_step: steps.find(s => s.aiAnalysis?.threat_level === 'CRITICAL' || s.aiAnalysis?.threat_level === 'HIGH'),
                total_threats_detected: threatCounts.CRITICAL + threatCounts.HIGH + threatCounts.MEDIUM
            };
        }
        
        generateRecommendations() {
            const scenario = this.simulationState.currentScenario;
            
            const recommendations = {
                normal: [
                    'Continue monitoring network traffic for anomalies',
                    'Implement regular security audits',
                    'Keep SS7 firewall rules updated'
                ],
                probing: [
                    'Implement rate limiting for routing queries',
                    'Monitor for unusual SRI request patterns',
                    'Consider blocking suspicious source networks'
                ],
                otp_theft: [
                    'Migrate to app-based authentication',
                    'Implement SMS delivery confirmations',
                    'Deploy real-time OTP interception detection'
                ],
                location_track: [
                    'Implement location query rate limiting',
                    'Monitor cross-border location requests',
                    'Deploy privacy protection mechanisms'
                ],
                call_redirect: [
                    'Implement call forwarding verification',
                    'Monitor for unauthorized routing changes',
                    'Deploy call path integrity checks'
                ],
                dos_attack: [
                    'Implement DDoS protection mechanisms',
                    'Deploy message rate limiting',
                    'Monitor resource utilization patterns'
                ],
                advanced_persistent: [
                    'Implement advanced persistent threat detection',
                    'Deploy behavior analysis systems',
                    'Regular security infrastructure audits'
                ]
            };
            
            return recommendations[scenario] || recommendations.normal;
        }
        
        /* ==================== QUIZ METHODS ==================== */
        
        loadEnhancedQuiz() {
            this.quizState.questions = this.generateAdaptiveQuestions();
            this.renderQuizQuestions();
        }
        
        generateAdaptiveQuestions() {
            const baseQuestions = [
                {
                    id: 1,
                    category: 'basic_awareness',
                    difficulty: 'beginner',
                    question: 'What is SS7 in mobile networks?',
                    options: [
                        'A signaling protocol for call setup and SMS',
                        'A type of mobile phone',
                        'A network security standard',
                        'A mobile app'
                    ],
                    correct: 0,
                    explanation: 'SS7 (Signaling System 7) is a protocol suite used for call setup, routing, and SMS delivery in mobile networks.'
                },
                {
                    id: 2,
                    category: 'threat_awareness',
                    difficulty: 'intermediate',
                    question: 'Which of these is a common SS7 attack method?',
                    options: [
                        'Physical phone theft',
                        'SMS/OTP interception',
                        'Battery drain attacks',
                        'Screen hacking'
                    ],
                    correct: 1,
                    explanation: 'SMS and OTP interception is one of the most common SS7 attacks, where attackers redirect text messages.'
                },
                {
                    id: 3,
                    category: 'security_practices',
                    difficulty: 'intermediate',
                    question: 'What is the safest alternative to SMS-based OTP?',
                    options: [
                        'Email OTP',
                        'Voice calls',
                        'Authenticator apps (TOTP)',
                        'No authentication'
                    ],
                    correct: 2,
                    explanation: 'Authenticator apps use TOTP (Time-based One-Time Passwords) which are not vulnerable to SS7 attacks.'
                },
                {
                    id: 4,
                    category: 'rural_context',
                    difficulty: 'advanced',
                    question: 'Why are rural networks in Nepal more vulnerable to SS7 attacks?',
                    options: [
                        'Higher internet speeds',
                        'More modern infrastructure',
                        'Legacy 2G/3G networks and limited monitoring',
                        'Better security awareness'
                    ],
                    correct: 2,
                    explanation: 'Rural areas often rely on older 2G/3G networks that use SS7 extensively, with limited security monitoring.'
                },
                {
                    id: 5,
                    category: 'technical_knowledge',
                    difficulty: 'advanced',
                    question: 'What should you do if you suspect your SMS are being intercepted?',
                    options: [
                        'Ignore it',
                        'Use SMS more frequently',
                        'Contact your mobile operator and switch to app-based authentication',
                        'Change your phone number every day'
                    ],
                    correct: 2,
                    explanation: 'Contact your operator to report the issue and switch to more secure authentication methods.'
                },
                {
                    id: 6,
                    category: 'detection',
                    difficulty: 'advanced',
                    question: 'What might indicate an SS7 attack is occurring?',
                    options: [
                        'Phone battery drains quickly',
                        'OTP messages arrive late or not at all',
                        'Screen brightness changes',
                        'Phone becomes heavy'
                    ],
                    correct: 1,
                    explanation: 'Delayed or missing OTP messages can indicate SMS interception attacks.'
                }
            ];
            
            // Add AI-generated contextual questions based on user's region/profile
            if (this.ai) {
                baseQuestions.push(...this.generateContextualQuestions());
            }
            
            return baseQuestions;
        }
        
        generateContextualQuestions() {
            return [
                {
                    id: 101,
                    category: 'local_context',
                    difficulty: 'intermediate',
                    question: 'In rural Nepal, which service is most commonly used for mobile banking?',
                    options: [
                        'eSewa',
                        'Khalti',
                        'IME Pay',
                        'All of the above'
                    ],
                    correct: 3,
                    explanation: 'Multiple mobile payment services are popular in Nepal, all potentially vulnerable to SS7 attacks.'
                },
                {
                    id: 102,
                    category: 'practical_security',
                    difficulty: 'beginner',
                    question: 'If you receive an unexpected call asking for your OTP, you should:',
                    options: [
                        'Share it immediately',
                        'Never share it - it\'s likely a scam',
                        'Share it only if they know your name',
                        'Ask them to call back later'
                    ],
                    correct: 1,
                    explanation: 'Never share OTPs over phone calls. Legitimate services never ask for OTPs via phone.'
                }
            ];
        }
        
        renderQuizQuestions() {
            const quizForm = document.getElementById('quizForm');
            if (!quizForm) return;
            
            quizForm.innerHTML = '';
            
            // Show subset of questions (adaptive)
            const questionsToShow = this.selectAdaptiveQuestions();
            
            questionsToShow.forEach((question, index) => {
                const questionCard = document.createElement('div');
                questionCard.className = 'q-card hover-lift';
                questionCard.innerHTML = `
                    <p><strong>${index + 1}. ${this.escapeHtml(question.question)}</strong></p>
                    <div class="q-metadata">
                        <span class="difficulty ${question.difficulty}">${question.difficulty}</span>
                        <span class="category">${question.category.replace('_', ' ')}</span>
                    </div>
                    <div class="q-options">
                        ${question.options.map((option, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="q_${question.id}" value="${optIndex}">
                                <span class="option-text">${this.escapeHtml(option)}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                quizForm.appendChild(questionCard);
            });
            
            this.quizState.currentQuestions = questionsToShow;
            this.updateQuizProgress(0);
        }
        
        selectAdaptiveQuestions() {
            // Start with beginner questions, adapt based on performance
            const questions = this.quizState.questions;
            const beginnerQuestions = questions.filter(q => q.difficulty === 'beginner');
            const intermediateQuestions = questions.filter(q => q.difficulty === 'intermediate');
            const advancedQuestions = questions.filter(q => q.difficulty === 'advanced');
            
            // Initial adaptive selection (can be enhanced based on previous answers)
            return [
                ...beginnerQuestions.slice(0, 2),
                ...intermediateQuestions.slice(0, 2),
                ...advancedQuestions.slice(0, 2)
            ];
        }
        
        async submitQuiz() {
            const formData = new FormData(document.getElementById('quizForm'));
            const answers = [];
            
            this.quizState.currentQuestions.forEach(question => {
                const answer = formData.get(`q_${question.id}`);
                answers.push({
                    question_id: question.id,
                    selected: answer ? parseInt(answer) : -1,
                    correct: question.correct,
                    is_correct: answer ? parseInt(answer) === question.correct : false
                });
            });
            
            // Calculate enhanced scoring with AI
            const results = await this.calculateEnhancedQuizResults(answers);
            
            // Show results
            this.showEnhancedResults(results);
        }
        
        async calculateEnhancedQuizResults(answers) {
            let correctAnswers = 0;
            let totalAnswers = answers.length;
            const categoryScores = {};
            const riskFactors = [];
            
            // Analyze answers by category
            answers.forEach(answer => {
                const question = this.quizState.currentQuestions.find(q => q.id === answer.question_id);
                if (!question) return;
                
                if (!categoryScores[question.category]) {
                    categoryScores[question.category] = { correct: 0, total: 0 };
                }
                
                categoryScores[question.category].total++;
                
                if (answer.is_correct) {
                    correctAnswers++;
                    categoryScores[question.category].correct++;
                } else {
                    // Identify risk factors based on wrong answers
                    if (question.category === 'threat_awareness' && !answer.is_correct) {
                        riskFactors.push('Low threat awareness');
                    }
                    if (question.category === 'security_practices' && !answer.is_correct) {
                        riskFactors.push('Poor security practices');
                    }
                }
            });
            
            const score = correctAnswers / totalAnswers;
            let riskLevel;
            
            if (score >= 0.8) riskLevel = 'Low';
            else if (score >= 0.6) riskLevel = 'Medium';
            else if (score >= 0.4) riskLevel = 'High';
            else riskLevel = 'Critical';
            
            // Generate AI-powered recommendations
            const recommendations = await this.generateAIRecommendations(categoryScores, riskFactors, riskLevel);
            
            return {
                score: correctAnswers,
                total: totalAnswers,
                percentage: Math.round(score * 100),
                risk_level: riskLevel,
                category_scores: categoryScores,
                risk_factors: riskFactors,
                recommendations: recommendations,
                ai_analysis: this.ai ? await this.ai.analyzeQuizResults(answers) : null
            };
        }
        
        async generateAIRecommendations(categoryScores, riskFactors, riskLevel) {
            const recommendations = [];
            
            // Basic recommendations based on category performance
            Object.entries(categoryScores).forEach(([category, scores]) => {
                const performance = scores.correct / scores.total;
                
                if (performance < 0.5) {
                    switch (category) {
                        case 'basic_awareness':
                            /**
     * Enhanced SS7 Awareness Application - Main JavaScript
     * Integrated with AI Engine for advanced threat detection
     */

    class SS7EnhancedApp {
        constructor() {
            this.currentSection = null;
            this.simulationState = {
                isRunning: false,
                currentScenario: 'normal',
                stepIndex: 0,
                steps: []
            };
            
            this.operatorState = {
                isLogging: false,
                logs: [],
                aiAnalysisEnabled: true,
                currentModel: 'lstm'
            };
            
            this.quizState = {
                questions: [],
                currentQuestion: 0,
                answers: [],
                adaptiveMode: true
            };
            
            this.stats = {
                threatsDetected: 0,
                simulationsRun: 0,
                alertsGenerated: 0,
                aiAccuracy: 98.7
            };
            
            this.translations = this.initializeTranslations();
            this.currentLang = 'en';
            
            this.initialize();
        }
        
        async initialize() {
            console.log('🚀 Initializing Enhanced SS7 App...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Wait for AI engine to initialize
            await this.waitForAI();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup AI event listeners
            this.setupAIEventListeners();
            
            // Initialize sections
            this.initializeSections();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('✅ Enhanced SS7 App initialized successfully');
        }
        
        showLoadingScreen() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
            }
        }
        
        hideLoadingScreen() {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 1000);
            }
        }
        
        async waitForAI() {
            // Wait for AI engine to be available
            let attempts = 0;
            while (!window.SS7AI && attempts < 50) {
                await this.delay(100);
                attempts++;
            }
            
            if (window.SS7AI) {
                console.log('🤖 AI Engine connected');
                this.ai = window.SS7AI;
                this.ai.isAnalyzing = true; // Enable analysis by default
            } else {
                console.warn('⚠️ AI Engine not available, running in fallback mode');
            }
        }
        
        initializeUI() {
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Update stats display
            this.updateStatsDisplay();
            
            // Initialize controls
            this.initializeControls();
        }
        
        initializeControls() {
            // Intensity slider
            const intensitySlider = document.getElementById('simIntensity');
            const intensityValue = document.getElementById('intensityValue');
            
            if (intensitySlider && intensityValue) {
                intensitySlider.addEventListener('input', (e) => {
                    intensityValue.textContent = e.target.value;
                });
            }
            
            // Speed slider for operator logs
            const speedSlider = document.getElementById('logSpeed');
            const speedValue = document.getElementById('speedValue');
            
            if (speedSlider && speedValue) {
                speedSlider.addEventListener('input', (e) => {
                    speedValue.textContent = `${e.target.value}ms`;
                });
            }
        }
        
        setupEventListeners() {
            // Navigation
            document.getElementById('startSimBtn')?.addEventListener('click', () => this.showSection('simulation'));
            document.getElementById('goSim')?.addEventListener('click', () => this.showSection('simulation'));
            document.getElementById('goQuiz')?.addEventListener('click', () => this.showSection('quiz'));
            document.getElementById('goTraining')?.addEventListener('click', () => this.showSection('training'));
            
            // Simulation controls
            document.getElementById('runScenario')?.addEventListener('click', () => this.runScenario());
            document.getElementById('stopScenario')?.addEventListener('click', () => this.stopScenario());
            document.getElementById('nextStep')?.addEventListener('click', () => this.nextSimulationStep());
            document.getElementById('restartSim')?.addEventListener('click', () => this.restartSimulation());
            document.getElementById('generateReport')?.addEventListener('click', () => this.generateAIReport());
            
            // Quiz controls
            document.getElementById('submitQuiz')?.addEventListener('click', () => this.submitQuiz());
            document.getElementById('resetQuiz')?.addEventListener('click', () => this.resetQuiz());
            
            // Results controls
            document.getElementById('downloadReport')?.addEventListener('click', () => this.downloadReport());
            document.getElementById('shareResults')?.addEventListener('click', () => this.shareResults());
            
            // Operator controls
            document.getElementById('startLogs')?.addEventListener('click', () => this.startLiveLogs());
            document.getElementById('stopLogs')?.addEventListener('click', () => this.stopLiveLogs());
            document.getElementById('genAttack')?.addEventListener('click', () => this.generateAttackBurst());
            document.getElementById('runDeepAnalysis')?.addEventListener('click', () => this.runDeepAnalysis());
            document.getElementById('trainModel')?.addEventListener('click', () => this.showSection('training'));
            document.getElementById('clearLogs')?.addEventListener('click', () => this.clearLogs());
            document.getElementById('exportLogs')?.addEventListener('click', () => this.exportLogs());
            
            // Training controls
            document.getElementById('startTraining')?.addEventListener('click', () => this.startModelTraining());
            document.getElementById('stopTraining')?.addEventListener('click', () => this.stopModelTraining());
            document.getElementById('saveModel')?.addEventListener('click', () => this.saveModel());
            document.getElementById('loadModel')?.addEventListener('click', () => this.loadModel());
            
            // Language selector
            document.getElementById('langSelect')?.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
            
            // AI model selector
            document.getElementById('aiModel')?.addEventListener('change', (e) => {
                this.setAIModel(e.target.value);
            });
        }
        
        setupAIEventListeners() {
            // AI training progress
            window.addEventListener('ai-training-progress', (e) => {
                this.updateTrainingProgress(e.detail);
            });
            
            // AI model metrics
            window.addEventListener('ai-model-metrics', (e) => {
                this.updateModelMetrics(e.detail);
            });
            
            // AI threat detection
            window.addEventListener('ai-threat-detected', (e) => {
                this.handleAIThreatDetection(e.detail);
            });
            
            // AI anomaly detection
            window.addEventListener('ai-anomaly-detected', (e) => {
                this.handleAIAnomalyDetection(e.detail);
            });
            
            // AI training status
            window.addEventListener('ai-training-status', (e) => {
                this.updateTrainingStatus(e.detail);
            });
        }
        
        initializeSections() {
            // Load initial quiz questions
            this.loadEnhancedQuiz();
            
            // Initialize simulation
            this.initializeSimulation();
            
            // Setup default timeline
            const defaultSteps = this.buildScenarioSteps('normal', 5);
            this.renderTimeline(defaultSteps);
        }
        
        /* ==================== SIMULATION METHODS ==================== */
        
    /* ==================== SIMULATION METHODS ==================== */

    initializeSimulation() {
        this.simulationState.steps = [];
        this.simulationState.stepIndex = 0;
        this.simulationState.isRunning = false;
        this.simulationState.currentScenario = 'normal';
        
        // Initialize default scenario steps
        const defaultSteps = this.buildScenarioSteps('normal', 5);
        this.simulationState.steps = defaultSteps;
        
        // Reset any existing animations
        this.resetSVGAnimations();
        
        console.log('Simulation initialized with default scenario');
    }

    async runScenario() {
        const scenario = document.getElementById('simScenario')?.value || 'normal';
        const intensity = document.getElementById('simIntensity')?.value || 5;
        const aiMode = document.getElementById('aiMode')?.value || 'realtime';
        
        this.simulationState.isRunning = true;
        this.simulationState.currentScenario = scenario;
        this.stats.simulationsRun++;
        this.updateStatsDisplay();
        
        // Build scenario steps with AI enhancements
        this.simulationState.steps = await this.buildEnhancedScenarioSteps(scenario, intensity, aiMode);
        this.renderTimeline(this.simulationState.steps);
        
        // Reset animation state
        this.resetSVGAnimations();
        this.simulationState.stepIndex = 0;
        
        // Update AI confidence display
        this.updateAIConfidence(0);
        
        // Enable next step button
        document.getElementById('nextStep').disabled = false;
        
        // Auto-play simulation
        await this.autoPlaySimulation(intensity);
    }

    async buildEnhancedScenarioSteps(scenario, intensity, aiMode) {
        const baseSteps = this.buildScenarioSteps(scenario, intensity);
        
        // Enhance with AI analysis if available
        if (this.ai && aiMode === 'realtime') {
            for (let step of baseSteps) {
                // Generate AI insights for each step
                const mockLogLine = this.generateStepLogLine(step, scenario);
                const analysis = await this.ai.analyzeLine(mockLogLine);
                
                step.aiAnalysis = analysis;
                step.confidence = analysis.confidence;
                step.threatLevel = analysis.threat_level;
                step.insights = analysis.insights;
            }
        }
        
        return baseSteps;
    }

    buildScenarioSteps(scenario, intensity) {
        const intensityNum = Number(intensity) || 5;
        
        const scenarios = {
            normal: [
                {
                    step: 1,
                    title: "Network Registration",
                    description: "Mobile device registers with local BTS tower. Standard HLR authentication.",
                    duration: 1000
                },
                {
                    step: 2,
                    title: "SMS Routing",
                    description: "SMS message routed through normal SS7 path. No anomalies detected.",
                    duration: 800
                },
                {
                    step: 3,
                    title: "Call Setup Complete",
                    description: "Voice call established using standard signaling protocols.",
                    duration: 600
                }
            ],
            
            probing: [
                {
                    step: 1,
                    title: "Reconnaissance Begins",
                    description: "Attacker sends multiple SendRoutingInfo queries to map network topology.",
                    duration: 1200
                },
                {
                    step: 2,
                    title: "Location Probing",
                    description: "Systematic location queries attempt to track subscriber movements.",
                    duration: 1000
                },
                {
                    step: 3,
                    title: "Network Mapping",
                    description: "Attacker builds comprehensive map of network vulnerabilities.",
                    duration: 1500
                }
            ],
            
            otp_theft: [
                {
                    step: 1,
                    title: "Target Identification",
                    description: "Attacker identifies high-value target through network reconnaissance.",
                    duration: 800
                },
                {
                    step: 2,
                    title: "SMS Interception Setup",
                    description: "Malicious SS7 commands redirect SMS traffic to attacker-controlled number.",
                    duration: 1200
                },
                {
                    step: 3,
                    title: "OTP Theft Execution",
                    description: "Banking OTP intercepted and used for unauthorized transaction.",
                    duration: 1000
                },
                {
                    step: 4,
                    title: "Fraud Completion",
                    description: "Attacker successfully authenticates using stolen OTP.",
                    duration: 600
                }
            ],
            
            location_track: [
                {
                    step: 1,
                    title: "Target Selection",
                    description: "Attacker selects target subscriber for location surveillance.",
                    duration: 600
                },
                {
                    step: 2,
                    title: "Location Requests",
                    description: "Periodic UpdateLocation and routing queries track target movement.",
                    duration: 1500
                },
                {
                    step: 3,
                    title: "Movement Mapping",
                    description: "Real-time location data compiled into movement patterns.",
                    duration: 1200
                }
            ],
            
            call_redirect: [
                {
                    step: 1,
                    title: "Call Interception Setup",
                    description: "Attacker configures SS7 call forwarding to redirect incoming calls.",
                    duration: 1000
                },
                {
                    step: 2,
                    title: "Call Redirection Active",
                    description: "Victim's calls secretly forwarded to attacker's monitoring system.",
                    duration: 1500
                },
                {
                    step: 3,
                    title: "Conversation Monitoring",
                    description: "Attacker monitors private conversations in real-time.",
                    duration: 2000
                }
            ],
            
            dos_attack: [
                {
                    step: 1,
                    title: "Attack Preparation",
                    description: "Attacker assembles botnet of compromised SS7 access points.",
                    duration: 800
                },
                {
                    step: 2,
                    title: "Message Flooding",
                    description: "Massive volume of malformed SS7 messages overwhelm network resources.",
                    duration: 2000
                },
                {
                    step: 3,
                    title: "Service Disruption",
                    description: "Network services degraded or completely unavailable to legitimate users.",
                    duration: 1500
                }
            ],
            
            advanced_persistent: [
                {
                    step: 1,
                    title: "Stealth Infiltration",
                    description: "Advanced persistent threat establishes covert access to SS7 infrastructure.",
                    duration: 1500
                },
                {
                    step: 2,
                    title: "Long-term Monitoring",
                    description: "Threat actor maintains persistent surveillance of target communications.",
                    duration: 2500
                },
                {
                    step: 3,
                    title: "Data Exfiltration",
                    description: "Systematic extraction of sensitive communication metadata.",
                    duration: 2000
                },
                {
                    step: 4,
                    title: "Covering Tracks",
                    description: "Evidence of intrusion carefully concealed to avoid detection.",
                    duration: 1000
                }
            ]
        };
        
        const steps = scenarios[scenario] || scenarios.normal;
        
        // Adjust timing based on intensity
        return steps.map(step => ({
            ...step,
            duration: Math.max(step.duration * (11 - intensityNum) / 10, 300)
        }));
    }

    generateStepLogLine(step, scenario) {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        
        const logTemplates = {
            normal: `[INFO] ${timestamp} - ${step.title}: Normal network operation`,
            probing: `[NOTICE] ${timestamp} - SendRoutingInfo request pattern detected for ${step.title}`,
            otp_theft: `[ALERT] ${timestamp} - Potential OTP theft: ${step.description}`,
            location_track: `[WARNING] ${timestamp} - Location tracking activity: ${step.title}`,
            call_redirect: `[ALERT] ${timestamp} - Call forwarding anomaly: ${step.description}`,
            dos_attack: `[CRITICAL] ${timestamp} - DoS attack pattern: ${step.title}`,
            advanced_persistent: `[WARNING] ${timestamp} - APT activity: ${step.description}`
        };
        
        return logTemplates[scenario] || logTemplates.normal;
    }

    async autoPlaySimulation(intensity) {
        const steps = this.simulationState.steps;
        
        for (let i = 0; i < steps.length && this.simulationState.isRunning; i++) {
            this.simulationState.stepIndex = i;
            
            // Update timeline highlight
            this.highlightTimelineStep(i);
            
            // Update AI confidence based on step analysis
            if (steps[i].aiAnalysis) {
                this.updateAIConfidence(steps[i].aiAnalysis.confidence);
                this.updateAIInsights(steps[i].aiAnalysis);
            }
            
            // Run step animation
            await this.animateScenarioStep(i, this.simulationState.currentScenario);
            
            // Wait for step duration
            await this.delay(steps[i].duration);
            
            // Update threat detection stats
            if (steps[i].threatLevel && steps[i].threatLevel !== 'NORMAL') {
                this.stats.threatsDetected++;
                this.updateStatsDisplay();
            }
        }
        
        // Disable next step button when complete
        document.getElementById('nextStep').disabled = true;
    }

    async animateScenarioStep(stepIndex, scenario) {
        const svg = document.getElementById('simSVG');
        if (!svg) return;
        
        const victim = document.getElementById('victim');
        const attacker = document.getElementById('attacker');
        const routeLine = document.getElementById('routeLine');
        const otpBubble = document.getElementById('otpBubble');
        const threatIndicators = document.getElementById('threatIndicators');
        
        switch (stepIndex) {
            case 0:
                // Initial connection/reconnaissance
                if (routeLine) {
                    routeLine.style.opacity = '1';
                    this.animatePathDraw(routeLine);
                }
                break;
                
            case 1:
                // Network response or continued attack
                if (victim) {
                    this.pulseElement(victim, scenario === 'normal' ? '#10b981' : '#f59e0b');
                }
                
                if (scenario !== 'normal' && threatIndicators) {
                    threatIndicators.style.opacity = '0.8';
                }
                break;
                
            case 2:
                // Action completion or data theft
                if (scenario.includes('otp') || scenario.includes('theft')) {
                    if (otpBubble) {
                        otpBubble.style.opacity = '1';
                        await this.animateElementMovement(otpBubble, 
                            { cx: 260, cy: 190 }, 
                            { cx: 500, cy: 100 }, 
                            1000
                        );
                        setTimeout(() => otpBubble.style.opacity = '0', 1200);
                    }
                }
                
                if (attacker && scenario !== 'normal') {
                    this.pulseElement(attacker, '#ef4444');
                }
                break;
                
            case 3:
                // Advanced scenarios final step
                if (scenario === 'advanced_persistent') {
                    // Simulate covering tracks
                    if (routeLine) routeLine.style.opacity = '0.3';
                    if (threatIndicators) threatIndicators.style.opacity = '0.2';
                }
                break;
        }
    }

    animatePathDraw(pathElement) {
        const length = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = `${length} ${length}`;
        pathElement.style.strokeDashoffset = length;
        pathElement.animate([
            { strokeDashoffset: length },
            { strokeDashoffset: 0 }
        ], {
            duration: 800,
            fill: 'forwards',
            easing: 'ease-in-out'
        });
    }

    pulseElement(element, color = '#06b6d4') {
        element.animate([
            { transform: 'scale(1)', fill: element.getAttribute('fill') },
            { transform: 'scale(1.4)', fill: color },
            { transform: 'scale(1)', fill: element.getAttribute('fill') }
        ], {
            duration: 600,
            easing: 'ease-in-out'
        });
    }

    async animateElementMovement(element, from, to, duration) {
        const animation = element.animate([
            { cx: from.cx, cy: from.cy },
            { cx: to.cx, cy: to.cy }
        ], {
            duration: duration,
            fill: 'forwards',
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        return new Promise(resolve => {
            animation.onfinish = resolve;
        });
    }

    stopScenario() {
        this.simulationState.isRunning = false;
        document.getElementById('nextStep').disabled = true;
    }

    nextSimulationStep() {
        if (this.simulationState.stepIndex < this.simulationState.steps.length) {
            const step = this.simulationState.steps[this.simulationState.stepIndex];
            
            this.highlightTimelineStep(this.simulationState.stepIndex);
            this.animateScenarioStep(this.simulationState.stepIndex, this.simulationState.currentScenario);
            
            if (step.aiAnalysis) {
                this.updateAIConfidence(step.aiAnalysis.confidence);
                this.updateAIInsights(step.aiAnalysis);
            }
            
            this.simulationState.stepIndex++;
            
            if (this.simulationState.stepIndex >= this.simulationState.steps.length) {
                document.getElementById('nextStep').disabled = true;
            }
        }
    }

    restartSimulation() {
        this.simulationState.stepIndex = 0;
        this.resetSVGAnimations();
        this.highlightTimelineStep(0);
        this.updateAIConfidence(0);
        document.getElementById('nextStep').disabled = false;
        
        const aiInsights = document.getElementById('aiInsightContent');
        if (aiInsights) {
            aiInsights.innerHTML = '<p class="muted">Run a simulation to see AI-powered threat analysis...</p>';
        }
    }

    resetSVGAnimations() {
        const routeLine = document.getElementById('routeLine');
        const otpBubble = document.getElementById('otpBubble');
        const threatIndicators = document.getElementById('threatIndicators');
        
        if (routeLine) {
            routeLine.style.opacity = '0';
            routeLine.style.strokeDasharray = 'none';
            routeLine.style.strokeDashoffset = '0';
        }
        
        if (otpBubble) {
            otpBubble.style.opacity = '0';
            otpBubble.setAttribute('cx', '260');
            otpBubble.setAttribute('cy', '190');
        }
        
        if (threatIndicators) {
            threatIndicators.style.opacity = '0';
        }
    }

    renderTimeline(steps) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;
        
        timeline.innerHTML = '';
        
        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'sim-step hover-lift';
            stepElement.innerHTML = `
                <div class="num">${step.step}</div>
                <div>
                    <h4>${this.escapeHtml(step.title)}</h4>
                    <p>${this.escapeHtml(step.description)}</p>
                    ${step.aiAnalysis ? `
                        <div class="ai-step-info">
                            <small class="threat-level ${step.threatLevel?.toLowerCase()}">${step.threatLevel}</small>
                            <small class="confidence">Confidence: ${Math.round(step.confidence * 100)}%</small>
                        </div>
                    ` : ''}
                </div>
            `;
            timeline.appendChild(stepElement);
        });
        
        this.highlightTimelineStep(0);
    }

    highlightTimelineStep(index) {
        const steps = document.querySelectorAll('.sim-step');
        steps.forEach((step, i) => {
            step.style.opacity = i === index ? '1' : '0.6';
            step.style.transform = i === index ? 'scale(1.02)' : 'scale(1)';
        });
    }

    updateAIConfidence(confidence) {
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceText = document.getElementById('confidenceText');
        
        if (confidenceFill) {
            confidenceFill.style.width = `${confidence * 100}%`;
        }
        
        if (confidenceText) {
            confidenceText.textContent = `${Math.round(confidence * 100)}%`;
        }
    }

    updateAIInsights(analysis) {
        const aiInsightContent = document.getElementById('aiInsightContent');
        if (!aiInsightContent) return;
        
        const insights = analysis.insights || [];
        const threatLevel = analysis.threat_level || 'NORMAL';
        const confidence = analysis.confidence || 0;
        
        aiInsightContent.innerHTML = `
            <div class="ai-analysis-header">
                <span class="threat-badge ${threatLevel.toLowerCase()}">${threatLevel}</span>
                <span class="confidence-badge">Confidence: ${Math.round(confidence * 100)}%</span>
            </div>
            <ul class="ai-insights-list">
                ${insights.map(insight => `<li>${this.escapeHtml(insight)}</li>`).join('')}
            </ul>
            <div class="ai-model-info">
                <small class="muted">Analysis by: ${analysis.model_used || 'LSTM'} Neural Network</small>
            </div>
        `;
    }

    async generateAIReport() {
        if (!this.ai || !this.simulationState.steps.length) {
            alert('No simulation data available for report generation.');
            return;
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            scenario: this.simulationState.currentScenario,
            steps_analyzed: this.simulationState.steps.length,
            threat_summary: this.generateThreatSummary(),
            recommendations: this.generateRecommendations(),
            ai_model: this.ai.currentModel
        };
        
        this.downloadFile(JSON.stringify(report, null, 2), 'ss7-ai-analysis-report.json');
    }

    generateThreatSummary() {
        const steps = this.simulationState.steps;
        const threatCounts = {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            NORMAL: 0
        };
        
        let totalConfidence = 0;
        
        steps.forEach(step => {
            if (step.aiAnalysis) {
                threatCounts[step.aiAnalysis.threat_level]++;
                totalConfidence += step.aiAnalysis.confidence;
            }
        });
        
        return {
            threat_distribution: threatCounts,
            average_confidence: totalConfidence / steps.length,
            highest_threat_step: steps.find(s => s.aiAnalysis?.threat_level === 'CRITICAL' || s.aiAnalysis?.threat_level === 'HIGH'),
            total_threats_detected: threatCounts.CRITICAL + threatCounts.HIGH + threatCounts.MEDIUM
        };
    }

    generateRecommendations() {
        const scenario = this.simulationState.currentScenario;
        
        const recommendations = {
            normal: [
                'Continue monitoring network traffic for anomalies',
                'Implement regular security audits',
                'Keep SS7 firewall rules updated'
            ],
            probing: [
                'Implement rate limiting for routing queries',
                'Monitor for unusual SRI request patterns',
                'Consider blocking suspicious source networks'
            ],
            otp_theft: [
                'Migrate to app-based authentication',
                'Implement SMS delivery confirmations',
                'Deploy real-time OTP interception detection'
            ],
            location_track: [
                'Implement location query rate limiting',
                'Monitor cross-border location requests',
                'Deploy privacy protection mechanisms'
            ],
            call_redirect: [
                'Implement call forwarding verification',
                'Monitor for unauthorized routing changes',
                'Deploy call path integrity checks'
            ],
            dos_attack: [
                'Implement DDoS protection mechanisms',
                'Deploy message rate limiting',
                'Monitor resource utilization patterns'
            ],
            advanced_persistent: [
                'Implement advanced persistent threat detection',
                'Deploy behavior analysis systems',
                'Regular security infrastructure audits'
            ]
        };
        
        return recommendations[scenario] || recommendations.normal;
    }

    /* ==================== UTILITY METHODS ==================== */

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateStatsDisplay() {
        const threatsDetectedEl = document.getElementById('threatsDetected');
        const simulationsRunEl = document.getElementById('simulationsRun');
        
        if (threatsDetectedEl) {
            this.animateNumber(threatsDetectedEl, this.stats.threatsDetected);
        }
        
        if (simulationsRunEl) {
            this.animateNumber(simulationsRunEl, this.stats.simulationsRun);
        }
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 10);
        
        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
            setTimeout(() => this.animateNumber(element, targetValue), 50);
        }
    }