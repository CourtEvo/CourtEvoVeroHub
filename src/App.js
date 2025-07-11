// src/App.js
import React, { useState, useEffect } from 'react';


// --- Sidebars & Wrappers ---
import SidebarNav             from './components/SidebarNav';
import BoardroomToolsSidebar  from './components/BoardroomToolsSidebar';
import BoardroomChatSidebar   from './components/BoardroomChatSidebar';
import ChatRoomMainView       from './components/ChatRoomMainView';
import MainCardWrapper        from './components/MainCardWrapper';
import Splash                 from './components/Splash';

// --- Boardroom Cockpit (NEW) ---
import BoardroomDashboard     from './components/BoardroomDashboard';
import BoardroomToolsMainCockpit from './components/BoardroomToolsMainCockpit';

// --- All your main modules ---
import ReportGenerator from "./components/ReportGenerator";
import ControlTowerDashboard from "./components/ControlTowerDashboard";
import AthleteDevelopment             from './components/AthleteDevelopment';
import AthleteDevelopmentPathway      from './components/AthleteDevelopmentPathway';
import AthleteWellnessPlayerVoice     from './components/AthleteWellnessPlayerVoice';
import CoachDevelopment               from './components/CoachDevelopment';
import CoachReflectionDiary           from './components/CoachReflectionDiary';
import ClubDashboard                  from './components/ClubDashboard';
import PerformanceDashboard           from './components/PerformanceDashboard';
import StrategicToolkit               from './components/StrategicToolkit';
import DiagnosticToolkit              from './components/DiagnosticToolkit';
import ScenarioBuilder                from './components/ScenarioBuilder';
import Benchmarking                   from './components/Benchmarking';
import BenchmarkingVisualizer         from './components/BenchmarkingVisualizer';
import AdvancedAnalytics              from './components/AdvancedAnalytics';
import MarketIntelligence             from './components/MarketIntelligence';
import ExecutiveSummary               from './components/ExecutiveSummary';
import EvaluationChecklist            from './components/EvaluationChecklist';
import TaskTracker                    from './components/TaskTracker';
import PathwayBuilder                 from './components/PathwayBuilder';
import PlayerProfileWithProgress      from './components/PlayerProfileWithProgress';
import ResourcePlanningDashboard from './components/ResourcePlanningDashboard';
import OrgChartVisualizer             from './components/OrgChartVisualizer';
import GovernanceSelfAudit            from './components/GovernanceSelfAudit';
import BoardroomDecisionLog           from './components/BoardroomDecisionLog';
import BoardPackGenerator             from './components/BoardPackGenerator';
import BoardKPIDashboard              from './components/BoardKPIDashboard';
import ComplianceCalendar             from './components/ComplianceCalendar';
import PlayerHolisticDashboard        from './components/PlayerHolisticDashboard';
import PlayerHolisticSuperDashboard   from './components/PlayerHolisticSuperDashboard';
import SensitivePeriodsTracker        from './components/SensitivePeriodsTracker';
import TrainingWindowOptimizer        from './components/TrainingWindowOptimizer';
import PracticeGameRatioAnalyzer      from './components/PracticeGameRatioAnalyzer';
import PeriodizationPlanner           from './components/PeriodizationPlanner';
import SessionPlanBuilder             from './components/SessionPlanBuilder';
import SkillsPassport                 from './components/SkillsPassport';
import AthleteWellnessDashboard       from './components/AthleteWellnessDashboard';
import ClubHealthDashboard            from './components/ClubHealthDashboard';
import ResourcePortal                 from './components/ResourcePortal';
import ParentPortal                   from './components/ParentPortal';
import AthleteFeedbackSurvey          from './components/AthleteFeedbackSurvey';
import AIProjections                  from './components/AIProjections';
import IndividualizedPlanGenerator    from './components/IndividualizedPlanGenerator';

// --- Specialized Modules ---
import ClubCoachDiagnostic            from './components/ClubCoachDiagnostic';
import ClubCoachSelfAssessment        from './components/ClubCoachSelfAssessment';
import EthicsCharacterBuilder         from './components/EthicsCharacterBuilder';
import FinancialEquityMonitor         from './components/FinancialEquityMonitor';
import GrantApplicationAnalyzer       from './components/GrantApplicationAnalyzer';
import BoardHealth360                 from './components/BoardHealth360';
import ParentEngagementPulse          from './components/ParentEngagementPulse';
import CoachHiringMatrix              from './components/CoachHiringMatrix';
import BoardSuccessionMatrix          from './components/BoardSuccessionMatrix';
import TalentPipelineAnalyzer         from './components/TalentPipelineAnalyzer';
import PlayerContractVisualizer       from './components/PlayerContractVisualizer';
import AgentTracker                   from './components/AgentTracker';
import HighPerformanceDashboard       from './components/HighPerformanceDashboard';
import KPIMatrix                      from './components/KPIMatrix';
import ResourceGapAnalyzer            from './components/ResourceGapAnalyzer';
import ReadinessMatrix                from './components/ReadinessMatrix';
import StakeholderMap                 from './components/StakeholderMap';
import ModifiedGameDesigner           from './components/ModifiedGameDesigner';
import ExecutiveBoardCockpit          from './components/ExecutiveBoardCockpit';
import AthleteDashboard               from './components/AthleteDashboard';
import AthletePathwayEngine           from './components/AthletePathwayEngine';
import CoachImpactAnalyzer            from './components/CoachImpactAnalyzer';
import PlayerTransitionScenarioBuilder from './components/PlayerTransitionScenarioBuilder';
import PlayerTransitionComparison     from './components/PlayerTransitionComparison';
import PlayerScenarioAI               from './components/PlayerScenarioAI';
import OrgScenarioAICockpit           from './components/OrgScenarioAICockpit';
import EnrichedMarketReport           from './components/EnrichedMarketReport';
import SponsorshipScanner             from './components/SponsorshipScanner';
import DynamicRolePromotion           from './components/DynamicRolePromotion';
import RiskDashboard                  from './components/RiskDashboard';
import PeerClubComparison             from './components/PeerClubComparison';
import MicrocycleDesigner             from './components/MicrocycleDesigner';
import SessionLibrary                 from './components/SessionLibrary';
import PathwayTransparency            from './components/PathwayTransparency';
import InsightToActionLog             from './components/InsightToActionLog';
import StakeholderEngagementMatrix    from './components/StakeholderEngagementMatrix';
import FacilityAccessAudit            from './components/FacilityAccessAudit';
import VolunteerPipeline              from './components/VolunteerPipeline';
import CommunityImpactDashboard       from './components/CommunityImpactDashboard';
import DecisionInsightActionLog       from './components/DecisionInsightActionLog';
import AINextBestAction               from './components/AINextBestAction';
import PolicyComplianceMasterLog      from './components/PolicyComplianceMasterLog';
import CoachCPDTracker                from './components/CoachCPDTracker';
import ClubBoardroomDiagnostic        from './components/ClubBoardroomDiagnostic';
import InnovationBoard                from './components/InnovationBoard';
import DataPrivacyEthics              from './components/DataPrivacyEthics';
import AcceleratorRoadmap             from './components/AcceleratorRoadmap';
import GlobalAuditLog                 from './components/GlobalAuditLog';
import BoardDecisionCalendar          from './components/BoardDecisionCalendar';
import AINextBestActionPopover        from './components/AINextBestActionPopover';

import RoleClarityMatrix              from './components/RoleClarityMatrix';
import DevelopmentStageTracker        from './components/DevelopmentStageTracker';
import FinancialOptimizer             from './components/FinancialOptimizer';
import OpsEfficiencyBlueprint         from './components/OpsEfficiencyBlueprint';
import GovernanceComplianceCenter     from './components/GovernanceComplianceCenter';
import BoardSentimentTracker          from './components/BoardSentimentTracker';
import RoleConflictRadar              from './components/RoleConflictRadar';
import ScenarioSensitivitySimulator   from './components/ScenarioSensitivitySimulator';
import PrivacyEthicsComplianceTracker from './components/PrivacyEthicsComplianceTracker';

// --- Extra ---
import LTADComplianceEngine           from './components/LTADComplianceEngine';
import PlayerTransitionRiskHeatmap    from './components/PlayerTransitionRiskHeatmap';
import StakeholderScorecard           from './components/StakeholderScorecard';
import MarketGapRadar                 from './components/MarketGapRadar';
import DynamicRoleRoadmap             from './components/DynamicRoleRoadmap';
import StrategicAlignmentDashboard from './components/StrategicAlignmentDashboard';
import YouthParticipationProjection from './components/YouthParticipationProjection';
import ResourceDashboard from './components/ResourceDashboard';
import ConsistencyDashboard from './components/ConsistencyDashboard';
import ClubManagementOptimizationDashboard from './components/ClubManagementOptimizationDashboard';
import OrganizationalIntegrationChart from './components/OrganizationalIntegrationChart';
import StrategicExecutionDashboard from './components/StrategicExecutionDashboard';
import ImplementationMonitoringDashboard from './components/ImplementationMonitoringDashboard';
import ComplianceMonitoringDashboard from './components/ComplianceMonitoringDashboard';
import StrategicGrowthDashboard from './components/StrategicGrowthDashboard';
import StrategicExecutionPlanDashboard from './components/StrategicExecutionPlanDashboard';
import SystemAlignmentMap from './components/SystemAlignmentMap';
import CompetencyFrameworkDashboard from './components/CompetencyFrameworkDashboard';
import MeetingAgendaDashboard from './components/MeetingAgendaDashboard';
import ClubOperationalEfficiencyModel from './components/ClubOperationalEfficiencyModel';
import WhatIfSimulator from "./components/WhatIfSimulator";
import ComplianceAutomation from "./components/ComplianceAutomation";
import AINextActionEngine from "./components/AINextActionEngine";
import AuditTrailDashboard from "./components/AuditTrailDashboard";
import CoachProfile from "./components/CoachProfile";
import LanguageSettings from "./components/LanguageSettings";
import DemoModeDashboard from "./components/DemoModeDashboard";
import SponsorshipActivationDashboard from './components/SponsorshipActivationDashboard';
import PerformanceReviewCycleDashboard from "./components/PerformanceReviewCycleDashboard";
import SponsorshipActivationBoard from "./components/SponsorshipActivationBoard";
import SponsorshipValueProjectionEngine from './components/SponsorshipValueProjectionEngine';
import PeriodizationCockpit from "./components/PeriodizationCockpit";
import SponsorshipValueAnalytics from './components/SponsorshipValueAnalytics';
import BoardroomCockpit from "./components/BoardroomCockpit";
import BoardroomDnDPipeline from "./components/BoardroomDnDPipeline";
import RiskContingencyDashboard from "./components/RiskContingencyDashboard";
import AthleteCompetitionPathwayDashboard from "./components/AthleteCompetitionPathwayDashboard";
import ClubStrategicGrowthDashboard from "./components/ClubStrategicGrowthDashboard";
import TalentPipelineLiveMap from "./components/TalentPipelineLiveMap";
import BoardroomDisputeCockpit from "./components/BoardroomDisputeCockpit";
import DigitalTransformationCenter from "./components/DigitalTransformationCenter";
import GlobalIntelligenceHub from "./components/GlobalIntelligenceHub";
import BlockchainTalentVerification from "./components/BlockchainTalentVerification";
import DigitalPerformanceLab from "./components/DigitalPerformanceLab";
import LongTermDevelopmentPlan from "./components/LongTermDevelopmentPlan";
import OperationalHealthDiagnostic from "./components/OperationalHealthDiagnostic";
import ProgressSnapshotCockpit from "./components/ProgressSnapshotCockpit";
import OrgEcosystemMap from "./components/OrgEcosystemMap";
import QuarterlyProgressReport from "./components/QuarterlyProgressReport";
import AthleteProgressDashboard from "./components/AthleteProgressDashboard";
import MultiAthleteProgressDashboard from "./components/MultiAthleteProgressDashboard";
import DecisionLogElite from "./components/DecisionLogElite";
import BoardroomPackSuite from "./components/BoardroomPackSuite";
import TalentVulnerabilityTracker from "./components/TalentVulnerabilityTracker";
import OrgDiagnosticScoringSuite from "./components/OrgDiagnosticScoringSuite";
import FeedbackLoopSuite from "./components/FeedbackLoopSuite";
import AssessmentTemplateSuite from "./components/AssessmentTemplateSuite";
import OperationalRoleClarityCockpit from "./components/OperationalRoleClarityCockpit";
import TalentAlumniIntelligenceSuite from "./components/TalentAlumniIntelligenceSuite";
import FinancialScenarioSuite from "./components/FinancialScenarioSuite";
import ProTeamOpsWarRoom from "./components/ProTeamOpsWarRoom";
import OperationalRaciScoredMatrix from "./components/OperationalRaciScoredMatrix";
import BoardroomIntelligenceFusionCenter from "./components/BoardroomIntelligenceFusionCenter";
import AthleteProgress360 from "./components/AthleteProgress360";
import InjuryRecoveryCockpit from "./components/InjuryRecoveryCockpit";
import PlayerScoutingMatrix from "./components/PlayerScoutingMatrix";
import StrategicGrowthExpansionEngine from "./components/StrategicGrowthExpansionEngine";
import StaffVolunteerHRDevelopmentSuite from "./components/StaffVolunteerHRDevelopmentSuite";
import CommunicationAnnouncementMatrix from "./components/CommunicationAnnouncementMatrix";
import CommunityEngagementSocialImpactDashboard from "./components/CommunityEngagementSocialImpactDashboard";
import AthleteProgressIDCardSuite from "./components/AthleteProgressIDCardSuite";
import InjuryRecoveryRTP from "./components/InjuryRecoveryRTP";
import TrainingMicrocycleBuilder from "./components/TrainingMicrocycleBuilder";
import PlayerScoutingTracker from "./components/PlayerScoutingTracker";
import StaffHRDevelopmentSuite from "./components/StaffHRDevelopmentSuite";
import CommsBoardroomCockpit from "./components/CommsBoardroomCockpit";
import CommunityImpactStudio from "./components/CommunityImpactStudio";
import StakeholderPipelineSuite from "./components/StakeholderPipelineSuite";
import ProgressReportingCenter from "./components/ProgressReportingCenter";
import GameBasedSessionPlanner from "./components/GameBasedSessionPlanner";
import LTADComplianceCockpit from "./components/LTADComplianceCockpit";
import BrandAssetPortfolioCockpit from "./components/BrandAssetPortfolioCockpit";
import ParticipationEquityAccessHeatmap from './components/ParticipationEquityAccessHeatmap';
import PhysicalLiteracyProgressionEngine from './components/PhysicalLiteracyProgressionEngine';
import PolicyFundingOpportunityRadar from './components/PolicyFundingOpportunityRadar';
import BarrierSolutionSuite from './components/BarrierSolutionSuite';
import FamilyCommunityPulse from './components/FamilyCommunityPulse';
import AdaptiveInclusiveDesigner from './components/AdaptiveInclusiveDesigner';
import SafeSportComplianceCockpit from './components/SafeSportComplianceCockpit';
import RetentionRiskRadar from './components/RetentionRiskRadar';
import TalentResilienceBuilder from './components/TalentResilienceBuilder';
import EliteTransitionCockpit from './components/EliteTransitionCockpit';
import ParentalPartnershipMatrix from './components/ParentalPartnershipMatrix';
import GameEnvironmentOptimizer from './components/GameEnvironmentOptimizer';
import OrganizationalPowerMap from './components/OrganizationalPowerMap';
import AgeBiasImpactAnalyzer from './components/AgeBiasImpactAnalyzer';
import SkillProgressionMasterMap from './components/SkillProgressionMasterMap';
import GameCentricSessionDesigner from './components/GameCentricSessionDesigner';
import ClubDecisionImpactVault from './components/ClubDecisionImpactVault';
import DynamicRoleEvolutionMatrix from './components/DynamicRoleEvolutionMatrix';
import StrategicStakeholderAlignmentMatrix from './components/StrategicStakeholderAlignmentMatrix';
import ClubResilienceContingencyCockpit from './components/ClubResilienceContingencyCockpit';
import BoardroomDecisionMasteryCockpit from './components/BoardroomDecisionMasteryCockpit';
import StrategicSponsorshipEngine from './components/StrategicSponsorshipEngine';
import HighPotentialPlayerOpportunityRadar from './components/HighPotentialPlayerOpportunityRadar';
import MultiYearSquadPlanningMatrix from './components/MultiYearSquadPlanningMatrix';
import PlayerContractLifecycleAnalyzer from './components/PlayerContractLifecycleAnalyzer';
import TalentMobilityScenarioSimulator from './components/TalentMobilityScenarioSimulator';
import DynamicTrialListBuilder from './components/DynamicTrialListBuilder';
import PerformanceConsistencyVolatilityAnalyzer from './components/PerformanceConsistencyVolatilityAnalyzer';
import AthleteGrowthWindowOptimizer from './components/AthleteGrowthWindowOptimizer';
import DevelopmentEnvironmentAuditRiskMap from './components/DevelopmentEnvironmentAuditRiskMap';
import TalentConcentrationEquityVisualizer from "./components/TalentConcentrationEquityVisualizer";
import StrategicAlignmentScenarioBoard from "./components/StrategicAlignmentScenarioBoard";
import IntegratedCoachDevelopmentMatrix from "./components/IntegratedCoachDevelopmentMatrix";
import ResourceUtilizationDashboard from "./components/ResourceUtilizationDashboard";
import ParticipationRetentionDropoutAnalyzer from "./components/ParticipationRetentionDropoutAnalyzer";
import StakeholderEngagementCockpit from "./components/StakeholderEngagementCockpit";
import TalentPipelineVulnerabilityRadar from "./components/TalentPipelineVulnerabilityRadar";
import AthleteMilestoneTimeline from "./components/AthleteMilestoneTimeline";
import AthleteTimelineCompareGantt from "./components/AthleteTimelineCompareGantt";
import LimitBreakerCard from "./components/LimitBreakerCard";
import ProTransitionReadinessDashboard from "./components/ProTransitionReadinessDashboard";
import SquadVulnerabilityRadarElite from "./components/SquadVulnerabilityRadarElite";
import OrgResilienceDisruptionDashboard from "./components/OrgResilienceDisruptionDashboard";
import FinancialScenarioSponsorshipSimulator from "./components/FinancialScenarioSponsorshipSimulator";
import ClubDNAAlignmentElite from "./components/ClubDNAAlignmentElite";
import StrategicRoadmapCockpitElite from "./components/StrategicRoadmapCockpitElite";
import StakeholderMapInfluenceElite from "./components/StakeholderMapInfluenceElite";
import TalentRiskSuccessionMatrixElite from "./components/TalentRiskSuccessionMatrixElite";
import PolicyChangeRadarElite from "./components/PolicyChangeRadarElite";
import StrategicInfluenceImpactMapElite from "./components/StrategicInfluenceImpactMapElite";
import BoardroomAISensemakingArena from "./components/BoardroomAISensemakingArena";
import AthleteExperienceEngagementSuite from "./components/AthleteExperienceEngagementSuite";
import BrandEquityCommandCenter from "./components/BrandEquityCommandCenter";
import InnovationBestPracticeBoard from "./components/InnovationBestPracticeBoard";
import DigitalAssetIPManagementSuite from "./components/DigitalAssetIPManagementSuite";
import ProgressionEngineElite from "./components/ProgressionEngineElite";
import BoardroomDecisionLogAI from "./components/BoardroomDecisionLogAI";

import PHVModule from "./components/PHVModule";
import LTADComplianceDashboard from "./components/LTADComplianceDashboard";
import SensitivePeriodsEngine from "./components/SensitivePeriodsEngine";
import RatioAnalyzer from "./components/RatioAnalyzer";
import HolisticPlayerDashboard from "./components/HolisticPlayerDashboard";
import CoachDevelopmentIntegration from "./components/CoachDevelopmentIntegration";
import ParentEngagementSuite from "./components/ParentEngagementSuite";
import RetentionDropoutHeatmap from "./components/RetentionDropoutHeatmap";
import TransitionRetentionEngine from "./components/TransitionRetentionEngine";
import CognitiveSkillsProgressionMatrix from './components/CognitiveSkillsProgressionMatrix';
import SocioEmotionalResilienceDashboard from './components/SocioEmotionalResilienceDashboard';
import MultiContextCompetitionReadinessEngine from './components/MultiContextCompetitionReadinessEngine';
import CoachAthleteFitMatrix from './components/CoachAthleteFitMatrix';
import AcademicDualPathwayProgressSuite from './components/AcademicDualPathwayProgressSuite';
import LongTermAthleteProjectionSimulator from './components/LongTermAthleteProjectionSimulator';
import CommunityFamilyEngagementImpactLab from './components/CommunityFamilyEngagementImpactLab';
import HolisticRecoveryInjuryPreventionSuite from './components/HolisticRecoveryInjuryPreventionSuite';
import TransitionPathwaysBoard from './components/TransitionPathwaysBoard';
import InvisibleAthleteDetector from './components/InvisibleAthleteDetector';
import CognitiveInjuryRecoveryDashboard from './components/CognitiveInjuryRecoveryDashboard';
import RoleEvolutionPromotionSimulator from './components/RoleEvolutionPromotionSimulator';
import RoleIdentityClarityEngine from './components/RoleIdentityClarityEngine';
import EnvironmentalAdaptabilityLab from './components/EnvironmentalAdaptabilityLab';
import MentalLoadOptimizationSuite from './components/MentalLoadOptimizationSuite';
import SocialCohesionAnalyticsStudio from './components/SocialCohesionAnalyticsStudio';
import LearningAgilityMatrix from './components/LearningAgilityMatrix';
import RelativeAgeEffectAnalyzer from './components/RelativeAgeEffectAnalyzer';
import GameSenseCoachLab from './components/GameSenseCoachLab';
import PositionalProficiencyTracker from './components/PositionalProficiencyTracker';
import DefensiveFootworkSimulator from './components/DefensiveFootworkSimulator';
import TeamCohesionAnalyticsStudio from './components/TeamCohesionAnalyticsStudio';
import StrategicOpsFusionCockpit from './components/StrategicOpsFusionCockpit';
import PracticeOptimizerLab from './components/PracticeOptimizerLab';
import OrganizationalCultureEngine from "./components/OrganizationalCultureEngine";



function App() {
  const [view, setView] = useState('Athletes');
  const [showSplash, setShowSplash] = useState(true);
  const [boardroomMode, setBoardroomMode] = useState(false);
  

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timeout);
  }, []);

  const isBoardroomTools = view === "BoardroomTools";
  const isBoardroomChat  = view === "BoardroomChat";

  if (showSplash) return <Splash show={true} />;

  // Choose the component to render via switch:
  let ActiveComponent;
  switch(view) {
    case 'ReportGenerator': ActiveComponent = ReportGenerator; break;
    case 'ControlTower': ActiveComponent = ControlTowerDashboard; break;
    case 'Athletes': ActiveComponent = AthleteDevelopment; break;
    case 'AthleteDevelopmentPathway': ActiveComponent = AthleteDevelopmentPathway; break;
    case 'Coaches': ActiveComponent = CoachDevelopment; break;
    case 'CoachReflection': ActiveComponent = CoachReflectionDiary; break;
    case 'Club': ActiveComponent = ClubDashboard; break;
    case 'Analytics': ActiveComponent = PerformanceDashboard; break;
    case 'Toolkit': ActiveComponent = StrategicToolkit; break;
    case 'Diagnostic': ActiveComponent = DiagnosticToolkit; break;
    case 'Scenario': ActiveComponent = ScenarioBuilder; break;
    case 'Benchmarking': ActiveComponent = Benchmarking; break;
    case 'BenchmarkingVisualizer': ActiveComponent = BenchmarkingVisualizer; break;
    case 'AdvancedAnalytics': ActiveComponent = AdvancedAnalytics; break;
    case 'MarketIntelligence': ActiveComponent = MarketIntelligence; break;
    case 'ExecutiveSummary': ActiveComponent = ExecutiveSummary; break;
    case 'EvaluationChecklist': ActiveComponent = EvaluationChecklist; break;
    case 'TaskTracker': ActiveComponent = TaskTracker; break;
    case 'PathwayBuilder': ActiveComponent = PathwayBuilder; break;
    case 'ProfileProgress': ActiveComponent = PlayerProfileWithProgress; break;
    case 'ResourcePlanningDashboard': ActiveComponent = ResourcePlanningDashboard; break;
    case 'OrgChartVisualizer': ActiveComponent = OrgChartVisualizer; break;
    case 'GovernanceSelfAudit': ActiveComponent = GovernanceSelfAudit; break;
    case 'BoardroomDecisionLog': ActiveComponent = BoardroomDecisionLog; break;
    case 'BoardPackGenerator': ActiveComponent = BoardPackGenerator; break;
    case 'BoardKPIDashboard': ActiveComponent = BoardKPIDashboard; break;
    case 'ComplianceCalendar': ActiveComponent = ComplianceCalendar; break;
    case 'PlayerHolisticDashboard': ActiveComponent = PlayerHolisticDashboard; break;
    case 'PlayerHolisticSuperDashboard': ActiveComponent = PlayerHolisticSuperDashboard; break;
    case 'SensitivePeriodsTracker': ActiveComponent = SensitivePeriodsTracker; break;
    case 'TrainingWindow': ActiveComponent = TrainingWindowOptimizer; break;
    case 'PracticeGameRatioAnalyzer': ActiveComponent = PracticeGameRatioAnalyzer; break;
    case 'PeriodizationPlanner': ActiveComponent = PeriodizationPlanner; break;
    case 'SessionPlanBuilder': ActiveComponent = SessionPlanBuilder; break;
    case 'SkillsPassport': ActiveComponent = SkillsPassport; break;
    case 'AthleteWellnessDashboard': ActiveComponent = AthleteWellnessDashboard; break;
    case 'AthleteWellnessVoice': ActiveComponent = AthleteWellnessPlayerVoice; break;
    case 'clubHealth': ActiveComponent = ClubHealthDashboard; break;
    case 'resourcePortal': ActiveComponent = ResourcePortal; break;
    case 'parentPortal': ActiveComponent = ParentPortal; break;
    case 'athleteFeedback': ActiveComponent = AthleteFeedbackSurvey; break;
    case 'aiProjections': ActiveComponent = AIProjections; break;
    case 'individualPlan': ActiveComponent = IndividualizedPlanGenerator; break;
    case 'ClubCoachDiagnostic': ActiveComponent = ClubCoachDiagnostic; break;
    case 'SelfAssessment': ActiveComponent = ClubCoachSelfAssessment; break;
    case 'EthicsCharacter': ActiveComponent = EthicsCharacterBuilder; break;
    case 'FinancialEquity': ActiveComponent = FinancialEquityMonitor; break;
    case 'GrantAnalyzer': ActiveComponent = GrantApplicationAnalyzer; break;
    case 'BoardHealth': ActiveComponent = BoardHealth360; break;
    case 'ParentPulse': ActiveComponent = ParentEngagementPulse; break;
    case 'CoachMatrix': ActiveComponent = CoachHiringMatrix; break;
    case 'SuccessionMatrix': ActiveComponent = BoardSuccessionMatrix; break;
    case 'TalentPipeline': ActiveComponent = TalentPipelineAnalyzer; break;
    case 'PlayerContracts': ActiveComponent = PlayerContractVisualizer; break;
    case 'agentTracker': ActiveComponent = AgentTracker; break;
    case 'HighPerformance': ActiveComponent = HighPerformanceDashboard; break;
    case 'KPIMatrix': ActiveComponent = KPIMatrix; break;
    case 'ResourceGap': ActiveComponent = ResourceGapAnalyzer; break;
    case 'ReadinessMatrix': ActiveComponent = ReadinessMatrix; break;
   	case 'StakeholderMap': ActiveComponent = StakeholderMap; break;
    case 'GameDesigner': ActiveComponent = ModifiedGameDesigner; break;
    case 'BoardCockpit': ActiveComponent = ExecutiveBoardCockpit; break;
    case 'AthleteDashboard': ActiveComponent = AthleteDashboard; break;
    case 'AthletePathwayEngine': ActiveComponent = AthletePathwayEngine; break;
    case 'CoachImpactAnalyzer': ActiveComponent = CoachImpactAnalyzer; break;
    case 'PlayerTransitionScenarioBuilder': ActiveComponent = PlayerTransitionScenarioBuilder; break;
    case 'PlayerTransitionComparison': ActiveComponent = PlayerTransitionComparison; break;
    case 'PlayerScenarioAI': ActiveComponent = PlayerScenarioAI; break;
    case 'OrgScenarioAICockpit': ActiveComponent = OrgScenarioAICockpit; break;
    case 'BoardroomChat': ActiveComponent = ChatRoomMainView; break;
    case 'LTADCompliance': ActiveComponent = LTADComplianceEngine; break;
    case 'TransitionHeatmap': ActiveComponent = PlayerTransitionRiskHeatmap; break;
    case 'StakeholderScorecard': ActiveComponent = StakeholderScorecard; break;
    case 'MarketGapRadar': ActiveComponent = MarketGapRadar; break;
    case 'DynamicRoleRoadmap': ActiveComponent = DynamicRoleRoadmap; break;
    case 'EnrichedMarketReport': ActiveComponent = EnrichedMarketReport; break;
    case 'SponsorshipScanner': ActiveComponent = SponsorshipScanner; break;
    case 'DynamicRolePromotion': ActiveComponent = DynamicRolePromotion; break;
    case 'RiskDashboard': ActiveComponent = RiskDashboard; break;
    case 'PeerComparison': ActiveComponent = PeerClubComparison; break;
    case 'MicrocycleDesigner': ActiveComponent = MicrocycleDesigner; break;
    case 'SessionLibrary': ActiveComponent = SessionLibrary; break;
    case 'PathwayTransparency': ActiveComponent = PathwayTransparency; break;
    case 'InsightToActionLog': ActiveComponent = InsightToActionLog; break;
    case 'StakeholderEngagement': ActiveComponent = StakeholderEngagementMatrix; break;
    case 'FacilityAudit': ActiveComponent = FacilityAccessAudit; break;
    case 'VolunteerPipeline': ActiveComponent = VolunteerPipeline; break;
    case 'CommunityImpact': ActiveComponent = CommunityImpactDashboard; break;
    case 'DecisionInsightActionLog': ActiveComponent = DecisionInsightActionLog; break;
    case 'AINextBestAction': ActiveComponent = AINextBestAction; break;
    case 'PolicyComplianceMasterLog': ActiveComponent = PolicyComplianceMasterLog; break;
    case 'CoachCPDTracker': ActiveComponent = CoachCPDTracker; break;
    case 'ClubBoardroomDiagnostic': ActiveComponent = ClubBoardroomDiagnostic; break;
    case 'InnovationBoard': ActiveComponent = InnovationBoard; break;
    case 'DataPrivacyEthics': ActiveComponent = DataPrivacyEthics; break;
    case 'AcceleratorRoadmap': ActiveComponent = AcceleratorRoadmap; break;
    case 'GlobalAuditLog': ActiveComponent = GlobalAuditLog; break;
    case 'BoardDecisionCalendar': ActiveComponent = BoardDecisionCalendar; break;
    case 'RoleClarity': ActiveComponent = RoleClarityMatrix; break;
    case 'DevStages': ActiveComponent = DevelopmentStageTracker; break;
    case 'FinancialOptimizer': ActiveComponent = FinancialOptimizer; break;
    case 'OpsBlueprint': ActiveComponent = OpsEfficiencyBlueprint; break;
    case 'GovCompliance': ActiveComponent = GovernanceComplianceCenter; break;
    case 'BoardSentiment': ActiveComponent = BoardSentimentTracker; break;
    case 'RoleConflictRadar': ActiveComponent = RoleConflictRadar; break;
    case 'ScenarioSimulator': ActiveComponent = ScenarioSensitivitySimulator; break;
    case 'PrivacyEthicsCompliance': ActiveComponent = PrivacyEthicsComplianceTracker; break;
    case 'StrategicAlignmentDashboard': ActiveComponent = StrategicAlignmentDashboard; break;
    case 'YouthParticipationProjection': ActiveComponent = YouthParticipationProjection; break;
    case 'ResourceDashboard': ActiveComponent = ResourceDashboard; break;
    case 'ConsistencyDashboard': ActiveComponent = ConsistencyDashboard; break;
    case 'ClubManagementOptimizationDashboard': ActiveComponent = ClubManagementOptimizationDashboard; break;
    case 'OrganizationalIntegrationChart': ActiveComponent = OrganizationalIntegrationChart; break;
    case 'StrategicExecutionDashboard': ActiveComponent = StrategicExecutionDashboard; break;
    case 'ImplementationMonitoringDashboard': ActiveComponent = ImplementationMonitoringDashboard; break;
    case 'ComplianceMonitoringDashboard': ActiveComponent = ComplianceMonitoringDashboard; break;
    case 'StrategicGrowthDashboard': ActiveComponent = StrategicGrowthDashboard; break;
    case 'StrategicExecutionPlanDashboard': ActiveComponent = StrategicExecutionPlanDashboard; break;
    case 'SystemAlignmentMap': ActiveComponent = SystemAlignmentMap; break;
    case 'CompetencyFrameworkDashboard': ActiveComponent = CompetencyFrameworkDashboard; break;
    case 'MeetingAgendaDashboard': ActiveComponent = MeetingAgendaDashboard; break;
    case "ClubOperationalEfficiencyModel": ActiveComponent = ClubOperationalEfficiencyModel; break;
    case 'WhatIfSimulator': ActiveComponent = WhatIfSimulator; break;
    case 'ComplianceAutomation': ActiveComponent = ComplianceAutomation; break;
    case 'AINextActionEngine': ActiveComponent = AINextActionEngine; break;
    case 'AuditTrail': ActiveComponent = AuditTrailDashboard; break;
    case 'CoachProfile': ActiveComponent = CoachProfile; break;
    case 'LanguageSettings': ActiveComponent = LanguageSettings; break;
    case 'DemoMode': ActiveComponent = DemoModeDashboard; break;
    case 'SponsorshipActivationDashboard': ActiveComponent = SponsorshipActivationDashboard; break;
    case 'PerformanceReviewCycle': ActiveComponent = PerformanceReviewCycleDashboard; break;
    case 'SponsorshipActivationBoard': ActiveComponent = SponsorshipActivationBoard; break;
    case 'SponsorshipValueProjection': ActiveComponent = SponsorshipValueProjectionEngine; break;
    case 'PeriodizationCockpit': ActiveComponent = PeriodizationCockpit; break;
    case 'SponsorshipValueAnalytics': ActiveComponent = SponsorshipValueAnalytics; break;
    case 'BoardroomCockpit': ActiveComponent = BoardroomCockpit; break;
    case 'BoardroomDnDPipeline': ActiveComponent = BoardroomDnDPipeline; break;
    case 'RiskContingencyDashboard': ActiveComponent = RiskContingencyDashboard; break;
    case 'AthleteCompetitionPathwayDashboard': ActiveComponent = AthleteCompetitionPathwayDashboard; break;
    case 'ClubStrategicGrowth': ActiveComponent = ClubStrategicGrowthDashboard; break;
    case 'TalentPipelineLiveMap': ActiveComponent = TalentPipelineLiveMap; break;
    case 'BoardroomDisputeCockpit': ActiveComponent = BoardroomDisputeCockpit; break;
    case 'DTC': ActiveComponent = DigitalTransformationCenter; break;
    case 'GIH': ActiveComponent = GlobalIntelligenceHub; break;
    case 'BTV': ActiveComponent = BlockchainTalentVerification; break;
    case 'DigitalPerformanceLab': ActiveComponent = DigitalPerformanceLab; break;
    case 'LongTermDevelopmentPlan': ActiveComponent = LongTermDevelopmentPlan; break;
    case 'OperationalHealthDiagnostic': ActiveComponent = OperationalHealthDiagnostic; break;
    case 'ProgressSnapshotCockpit': ActiveComponent = ProgressSnapshotCockpit; break;
    case 'OrgEcosystemMap': ActiveComponent = OrgEcosystemMap; break;
    case 'QuarterlyProgressReport': ActiveComponent = QuarterlyProgressReport; break;
    case 'AthleteProgressDashboard': ActiveComponent = AthleteProgressDashboard; break;
    case 'MultiAthleteProgressDashboard': ActiveComponent = MultiAthleteProgressDashboard; break;
    case 'DecisionLogElite': ActiveComponent = DecisionLogElite; break; 
    case 'BoardroomPackSuite': ActiveComponent = BoardroomPackSuite; break;
    case 'TalentVulnerabilityTracker': ActiveComponent = TalentVulnerabilityTracker; break;
    case 'OrgDiagnosticScoringSuite': ActiveComponent = OrgDiagnosticScoringSuite; break;
    case 'FeedbackLoopSuite': ActiveComponent = FeedbackLoopSuite; break;
    case 'AssessmentTemplateSuite': ActiveComponent = AssessmentTemplateSuite; break;
    case 'OperationalRoleClarityCockpit': ActiveComponent = OperationalRoleClarityCockpit; break;
    case 'TalentAlumniIntelligenceSuite': ActiveComponent = TalentAlumniIntelligenceSuite; break;
    case 'FinancialScenarioSuite': ActiveComponent = FinancialScenarioSuite; break;
    case 'ProTeamOpsWarRoom': ActiveComponent = ProTeamOpsWarRoom; break;
    case 'OperationalRACIScoredMatrix': ActiveComponent = OperationalRaciScoredMatrix; break;
    case 'BoardroomIntelligenceFusionCenter': ActiveComponent = BoardroomIntelligenceFusionCenter; break;
    case 'AthleteProgress360': ActiveComponent = AthleteProgress360; break;
    case 'InjuryRecoveryCockpit': ActiveComponent = InjuryRecoveryCockpit; break;
    case 'PlayerScoutingMatrix': ActiveComponent = PlayerScoutingMatrix; break;
    case 'StrategicGrowthExpansionEngine': ActiveComponent = StrategicGrowthExpansionEngine; break;
    case 'StaffVolunteerHRDevelopmentSuite': ActiveComponent = StaffVolunteerHRDevelopmentSuite; break;
    case 'CommunicationAnnouncementMatrix': ActiveComponent = CommunicationAnnouncementMatrix; break;
    case 'CommunityEngagementSocialImpactDashboard': ActiveComponent = CommunityEngagementSocialImpactDashboard; break;
    case 'AthleteProgressIDCardSuite': ActiveComponent = AthleteProgressIDCardSuite; break;
    case 'InjuryRecoveryRTP': ActiveComponent = InjuryRecoveryRTP; break;
    case 'TrainingMicrocycleBuilder': ActiveComponent = TrainingMicrocycleBuilder; break;
    case 'PlayerScoutingTracker': ActiveComponent = PlayerScoutingTracker; break;
    case 'StaffHRDevelopmentSuite': ActiveComponent = StaffHRDevelopmentSuite; break;
    case 'CommsBoardroomCockpit': ActiveComponent = CommsBoardroomCockpit; break;
    case 'CommunityImpactStudio': ActiveComponent = CommunityImpactStudio; break;
    case 'StakeholderPipelineSuite': ActiveComponent = StakeholderPipelineSuite; break;
    case 'ProgressReportingCenter': ActiveComponent = ProgressReportingCenter; break;
    case 'GameBasedSessionPlanner': ActiveComponent = GameBasedSessionPlanner; break;
    case 'LTADComplianceCockpit': ActiveComponent = LTADComplianceCockpit; break;
    case 'BrandAssetPortfolioCockpit': ActiveComponent = BrandAssetPortfolioCockpit; break;
    case 'EquityHeatmap': ActiveComponent = ParticipationEquityAccessHeatmap; break;
    case 'PhysicalLiteracy': ActiveComponent = PhysicalLiteracyProgressionEngine; break;
    case 'PolicyFunding': ActiveComponent = PolicyFundingOpportunityRadar; break;
    case 'BarrierSuite': ActiveComponent = BarrierSolutionSuite; break;
    case 'FamilyPulse': ActiveComponent = FamilyCommunityPulse; break;
    case 'AdaptiveDesigner': ActiveComponent = AdaptiveInclusiveDesigner; break;
    case 'SafeSport': ActiveComponent = SafeSportComplianceCockpit; break;
    case 'RetentionRadar': ActiveComponent = RetentionRiskRadar; break;
    case 'TalentResilience': ActiveComponent = TalentResilienceBuilder; break;
    case 'EliteTransition': ActiveComponent = EliteTransitionCockpit; break;
    case 'ParentMatrix': ActiveComponent = ParentalPartnershipMatrix; break;
    case 'GameEnvOpt': ActiveComponent = GameEnvironmentOptimizer; break;
    case 'PowerMap': ActiveComponent = OrganizationalPowerMap; break;
    case 'AgeBiasAnalyzer': ActiveComponent = AgeBiasImpactAnalyzer; break;
    case 'SkillMasterMap': ActiveComponent = SkillProgressionMasterMap; break;
    case 'GameSessionDesigner': ActiveComponent = GameCentricSessionDesigner; break;
    case 'DecisionImpactVault': ActiveComponent = ClubDecisionImpactVault; break;
    case 'RoleEvolutionMatrix': ActiveComponent = DynamicRoleEvolutionMatrix; break;
    case 'StakeholderMatrix': ActiveComponent = StrategicStakeholderAlignmentMatrix; break;
    case 'ResilienceCockpit': ActiveComponent = ClubResilienceContingencyCockpit; break;
    case 'DecisionMastery': ActiveComponent = BoardroomDecisionMasteryCockpit; break;
    case 'SponsorshipEngine': ActiveComponent = StrategicSponsorshipEngine; break;
    case 'PlayerOpportunityRadar': ActiveComponent = HighPotentialPlayerOpportunityRadar; break;
    case 'SquadMatrix': ActiveComponent = MultiYearSquadPlanningMatrix; break;
    case 'ContractLifecycle': ActiveComponent = PlayerContractLifecycleAnalyzer; break;
    case 'MobilityScenario': ActiveComponent = TalentMobilityScenarioSimulator; break;
    case 'TrialList': ActiveComponent = DynamicTrialListBuilder; break;
    case 'VolatilityAnalyzer': ActiveComponent = PerformanceConsistencyVolatilityAnalyzer; break;
    case 'GrowthWindow': ActiveComponent = AthleteGrowthWindowOptimizer; break;
    case 'EnvAudit': ActiveComponent = DevelopmentEnvironmentAuditRiskMap; break;
    case 'TalentEquityVisualizer': ActiveComponent = TalentConcentrationEquityVisualizer; break;
    case 'StrategicAlignmentBoard': ActiveComponent = StrategicAlignmentScenarioBoard; break;
    case 'CoachDevMatrix': ActiveComponent = IntegratedCoachDevelopmentMatrix; break;
    case 'ResourceUtilDashboard': ActiveComponent = ResourceUtilizationDashboard; break;
    case 'ParticipationDropoutAnalyzer': ActiveComponent = ParticipationRetentionDropoutAnalyzer; break;
    case 'StakeholderEngagementCockpit': ActiveComponent = StakeholderEngagementCockpit; break;
    case 'TalentPipelineVulnerabilityRadar': ActiveComponent = TalentPipelineVulnerabilityRadar; break;
    case 'AthleteMilestoneTimeline': ActiveComponent = AthleteMilestoneTimeline; break;
    case 'AthleteTimelineCompareGantt': ActiveComponent = AthleteTimelineCompareGantt; break;
    case 'LimitBreakerCard': ActiveComponent = LimitBreakerCard; break;
    case 'ProTransitionReadinessDashboard': ActiveComponent = ProTransitionReadinessDashboard; break;
    case 'SquadVulnerabilityRadarElite': ActiveComponent = SquadVulnerabilityRadarElite; break;
    case 'OrgResilienceDisruptionDashboard': ActiveComponent = OrgResilienceDisruptionDashboard; break;
    case 'FinancialScenarioSponsorshipSimulator': ActiveComponent = FinancialScenarioSponsorshipSimulator; break;
    case 'ClubDNAAlignmentElite': ActiveComponent = ClubDNAAlignmentElite; break;
    case 'StrategicRoadmapCockpitElite': ActiveComponent = StrategicRoadmapCockpitElite; break;
    case 'StakeholderMapInfluenceElite': ActiveComponent = StakeholderMapInfluenceElite; break;
    case 'TalentRiskSuccessionMatrixElite': ActiveComponent = TalentRiskSuccessionMatrixElite; break;
    case 'PolicyChangeRadarElite': ActiveComponent = PolicyChangeRadarElite; break;
    case 'StrategicInfluenceImpactMapElite': ActiveComponent = StrategicInfluenceImpactMapElite; break;
    case 'BoardroomAISensemakingArena': ActiveComponent = BoardroomAISensemakingArena; break;
    case 'AthleteExperienceEngagementSuite': ActiveComponent = AthleteExperienceEngagementSuite; break;
    case 'BrandEquityCommandCenter': ActiveComponent = BrandEquityCommandCenter; break;
    case 'InnovationBestPracticeBoard': ActiveComponent = InnovationBestPracticeBoard; break;
    case 'DigitalAssetIPManagementSuite': ActiveComponent = DigitalAssetIPManagementSuite; break;
    case 'ProgressionEngineElite': ActiveComponent = ProgressionEngineElite; break;
    case 'BoardroomDecisionLogAI': ActiveComponent = BoardroomDecisionLogAI; break;

    case 'PHVModule': ActiveComponent = PHVModule; break;
    case 'LTADComplianceDashboard': ActiveComponent = LTADComplianceDashboard; break;
    case 'SensitivePeriodsEngine': ActiveComponent = SensitivePeriodsEngine; break;
    case 'RatioAnalyzer': ActiveComponent = RatioAnalyzer; break;
    case 'HolisticPlayerDashboard': ActiveComponent = HolisticPlayerDashboard; break;
    case 'CoachDevelopmentIntegration': ActiveComponent = CoachDevelopmentIntegration; break;
    case 'ParentEngagementSuite': ActiveComponent = ParentEngagementSuite; break;
    case 'RetentionDropoutHeatmap': ActiveComponent = RetentionDropoutHeatmap; break;
    case 'TransitionRetentionEngine': ActiveComponent = TransitionRetentionEngine; break;
    case 'CognitiveSkillsMatrix': ActiveComponent = CognitiveSkillsProgressionMatrix; break;
    case 'SocioEmotionalResilience': ActiveComponent = SocioEmotionalResilienceDashboard; break;
    case 'MultiContextReadiness': ActiveComponent = MultiContextCompetitionReadinessEngine; break;
    case 'CoachAthleteFitMatrix': ActiveComponent = CoachAthleteFitMatrix; break;
    case 'AcademicDualPathwayProgress': ActiveComponent = AcademicDualPathwayProgressSuite; break;
    case 'LongTermAthleteProjectionSim': ActiveComponent = LongTermAthleteProjectionSimulator; break;
    case 'CommunityFamilyEngagementLab': ActiveComponent = CommunityFamilyEngagementImpactLab; break;
    case 'RecoveryInjuryPreventionSuite': ActiveComponent = HolisticRecoveryInjuryPreventionSuite; break;
    case 'TransitionPathwaysBoard': ActiveComponent = TransitionPathwaysBoard; break;
    case 'InvisibleAthleteDetector': ActiveComponent = InvisibleAthleteDetector; break;
    case 'CognitiveInjuryRecoveryDashboard': ActiveComponent = CognitiveInjuryRecoveryDashboard; break;
    case 'RoleEvolutionPromotionSimulator': ActiveComponent = RoleEvolutionPromotionSimulator; break;
    case 'RoleIdentityClarityEngine': ActiveComponent = RoleIdentityClarityEngine; break;
    case 'EnvironmentalAdaptabilityLab': ActiveComponent = EnvironmentalAdaptabilityLab; break;
    case 'MentalLoadOptimizationSuite': ActiveComponent = MentalLoadOptimizationSuite; break;
    case 'SocialCohesionAnalyticsStudio': ActiveComponent = SocialCohesionAnalyticsStudio; break;
    case 'LearningAgilityMatrix': ActiveComponent = LearningAgilityMatrix; break;
    case 'RelativeAgeEffectAnalyzer': ActiveComponent = RelativeAgeEffectAnalyzer; break;
    case 'GameSenseCoachLab': ActiveComponent = GameSenseCoachLab; break;
    case 'PositionalProficiencyTracker': ActiveComponent = PositionalProficiencyTracker; break;
    case 'DefensiveFootworkSimulator': ActiveComponent = DefensiveFootworkSimulator; break;
    case 'TeamCohesionAnalyticsStudio': ActiveComponent = TeamCohesionAnalyticsStudio; break;
    case 'StrategicOpsFusionCockpit': ActiveComponent = StrategicOpsFusionCockpit; break;
    case 'PracticeOptimizerLab': ActiveComponent = PracticeOptimizerLab; break;
    case 'OrganizationalCultureEngine': ActiveComponent = OrganizationalCultureEngine; break;




   
    default:
      ActiveComponent = () => <div style={{ padding: 20 }}>Select a module</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #283E51 0%, #485563 100%)',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#fff',
      display: 'flex',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <SidebarNav
        setView={setView}
        currentView={view}
        boardroomMode={boardroomMode}
        setBoardroomMode={setBoardroomMode}
      />

      {isBoardroomTools && (
        <BoardroomToolsSidebar setView={setView} currentView={view} />
      )}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        <header style={{
          margin: '38px 0 12px 0',
          paddingLeft: 10
        }}>
          <h1 style={{
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: 2
          }}>CourtEvo Vero Hub</h1>
          <div style={{
            fontSize: 16,
            fontStyle: 'italic',
            color: '#FFD700',
            marginTop: 4
          }}>BE REAL. BE VERO.</div>
          <div style={{ marginTop: 8 }}>
              </div>
        </header>
        <MainCardWrapper>
          {boardroomMode
            ? <BoardroomDashboard />
            : <ActiveComponent />
          }
        </MainCardWrapper>

        <footer style={{
          marginTop: 28,
          fontSize: 14,
          opacity: 0.6,
          textAlign: 'center'
        }}>
          © {new Date().getFullYear()} CourtEvo Vero. All Rights Reserved.
        </footer>
      </div>

      {isBoardroomChat && <BoardroomChatSidebar />}
      <AINextBestActionPopover />
    </div>
  );
}

export default App;
