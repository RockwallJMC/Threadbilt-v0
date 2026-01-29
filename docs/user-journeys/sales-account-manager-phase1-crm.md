# Sales Account Manager User Journey - Phase 1 CRM

## Role Overview

**Primary Responsibilities:**
- Manage assigned accounts and build customer relationships
- Convert qualified leads into opportunities
- Develop and present proposals to prospects
- Negotiate deals and close sales
- Maintain accurate pipeline and activity records
- Collaborate with internal teams for customer success

**Key Performance Indicators:**
- Monthly sales quota attainment
- Number of qualified opportunities created
- Proposal win rate and average deal size
- Sales cycle length and pipeline velocity
- Customer satisfaction and retention rates

## Daily Workflow Scenarios

### Morning Routine (8:00 AM - 9:00 AM)

**Scenario**: Daily pipeline review and priority setting

1. **Personal Dashboard Check** (`/dashboard/crm`)
   - Review personal pipeline value and forecast
   - Check overnight lead assignments
   - Identify urgent follow-ups and deadlines
   - Review today's scheduled activities

2. **Opportunity Priority Review** (`/apps/crm/opportunities`)
   - Filter opportunities by "Assigned to Me"
   - Sort by expected close date and value
   - Identify opportunities requiring immediate action
   - Check for stage progression opportunities

3. **Lead Follow-up Planning** (`/apps/crm/leads`)
   - Review newly assigned leads
   - Check leads requiring follow-up today
   - Plan outreach strategy and messaging
   - Update lead status based on recent activities

**Expected Outcome**: Clear daily priorities and action plan established

### Mid-Morning: Lead Qualification and Conversion (9:30 AM - 11:00 AM)

**Scenario**: Converting qualified leads to opportunities

1. **Lead Qualification Process** (`/apps/crm/leads/[id]`)
   - Review lead details and source information
   - Conduct discovery call or meeting
   - Update lead status based on qualification
   - Add detailed qualification notes

2. **Lead-to-Opportunity Conversion** (`/apps/crm/leads/[id]`)
   - Click "Convert to Opportunity" button
   - Pre-fill opportunity details from lead data
   - Set appropriate stage and probability
   - Define expected close date and value
   - Create initial opportunity plan

3. **Account and Contact Management** (`/apps/crm/accounts`, `/apps/crm/contacts`)
   - Create or update account information
   - Add new contacts discovered during qualification
   - Map contact relationships and roles
   - Update account strategic information

**Expected Outcome**: Qualified leads converted to trackable opportunities with complete account context

### Late Morning: Opportunity Development (11:00 AM - 12:00 PM)

**Scenario**: Advancing opportunities through the sales pipeline

1. **Opportunity Review** (`/apps/crm/opportunities/[id]`)
   - Review opportunity details and history
   - Check recent activities and next steps
   - Analyze competitive positioning
   - Update probability and stage as needed

2. **Activity Planning and Execution**
   - Schedule follow-up calls and meetings
   - Prepare for customer presentations
   - Coordinate with technical teams
   - Update opportunity timeline

3. **Pipeline Management** (`/apps/crm/opportunities`)
   - Use Kanban view to visualize pipeline
   - Drag opportunities between stages
   - Identify bottlenecks and stalled deals
   - Plan stage advancement strategies

**Expected Outcome**: Opportunities actively progressed with clear next steps

### Afternoon: Proposal Development (1:00 PM - 3:00 PM)

**Scenario**: Creating and managing proposals for qualified opportunities

1. **Proposal Creation** (`/apps/crm/proposals`)
   - Create new proposal from opportunity
   - Define proposal line items and pricing
   - Set proposal terms and conditions
   - Calculate total proposal value

2. **Proposal Review and Refinement** (`/apps/crm/proposals/[id]`)
   - Review proposal details for accuracy
   - Adjust pricing based on negotiation
   - Update proposal status and notes
   - Generate PDF for customer delivery

3. **Customer Presentation Preparation**
   - Prepare proposal presentation materials
   - Coordinate with technical team for demos
   - Schedule proposal review meetings
   - Plan negotiation strategy

**Expected Outcome**: Professional proposals ready for customer presentation

### Late Afternoon: Customer Engagement (3:00 PM - 5:00 PM)

**Scenario**: Direct customer interaction and relationship building

1. **Customer Calls and Meetings**
   - Conduct scheduled customer calls
   - Present proposals and handle objections
   - Gather customer feedback and requirements
   - Negotiate terms and pricing

2. **Activity Documentation** (`/apps/crm/opportunities/[id]`)
   - Log call notes and meeting outcomes
   - Update opportunity status and probability
   - Record next steps and follow-up actions
   - Update expected close dates

3. **Internal Coordination**
   - Communicate with technical teams
   - Update sales manager on progress
   - Coordinate with customer success team
   - Plan implementation timelines

**Expected Outcome**: Strong customer relationships maintained with documented progress

### End of Day: Pipeline Updates (5:00 PM - 5:30 PM)

**Scenario**: Daily pipeline maintenance and planning

1. **Pipeline Accuracy Check**
   - Review all opportunity updates
   - Ensure accurate stage and probability
   - Update expected close dates
   - Verify activity completion

2. **Tomorrow's Planning**
   - Review tomorrow's scheduled activities
   - Identify priority follow-ups
   - Plan new lead outreach
   - Prepare for scheduled meetings

**Expected Outcome**: Accurate pipeline data and clear next-day priorities

## Weekly Workflow Scenarios

### Monday: Weekly Pipeline Planning

**Scenario**: Weekly pipeline review and goal setting

1. **Personal Pipeline Analysis** (`/apps/crm/opportunities/forecast`)
   - Review weekly pipeline changes
   - Analyze personal forecast vs. quota
   - Identify opportunities for acceleration
   - Plan weekly activity goals

2. **Account Strategy Planning** (`/apps/crm/accounts`)
   - Review strategic account status
   - Plan account development activities
   - Identify expansion opportunities
   - Schedule account review meetings

3. **Lead Assignment Review** (`/apps/crm/leads`)
   - Review newly assigned leads
   - Plan lead qualification activities
   - Set lead follow-up schedule
   - Coordinate with marketing on lead quality

### Wednesday: Mid-Week Progress Check

**Scenario**: Mid-week pipeline health assessment

1. **Opportunity Progression Review**
   - Check opportunities advanced this week
   - Identify stalled opportunities
   - Plan acceleration strategies
   - Update probability assessments

2. **Proposal Status Review** (`/apps/crm/proposals`)
   - Check pending proposal responses
   - Follow up on overdue proposals
   - Plan proposal revision strategies
   - Schedule proposal review meetings

### Friday: Weekly Wrap-up and Forecasting

**Scenario**: Weekly results analysis and next week planning

1. **Weekly Results Review**
   - Analyze week's closed deals
   - Review activity completion rates
   - Calculate weekly quota progress
   - Document lessons learned

2. **Next Week Planning**
   - Set next week's priorities
   - Schedule important customer meetings
   - Plan proposal presentations
   - Coordinate team activities

## Key Feature Usage Patterns

### Primary Features (Daily Use)
- **Opportunities Kanban**: Visual pipeline management and stage progression
- **Lead Detail Pages**: Lead qualification and conversion
- **Opportunity Detail Pages**: Opportunity development and activity tracking
- **Activity Timeline**: Customer interaction history

### Secondary Features (Weekly Use)
- **Proposals Management**: Proposal creation and tracking
- **Account Management**: Strategic account planning
- **Contact Management**: Relationship mapping
- **Forecasting Dashboard**: Personal pipeline analysis

### Administrative Features (As Needed)
- **Lead Creation**: Manual lead entry
- **Account Creation**: New account setup
- **Contact Creation**: New contact addition
- **Bulk Updates**: Pipeline maintenance

## Success Metrics and KPIs

### Sales Performance Metrics
- **Monthly Quota Attainment**: 100%+ individual target
- **Pipeline Value**: 3x monthly quota minimum
- **Weighted Forecast Accuracy**: 90%+ monthly
- **Average Deal Size**: Increase 10% quarterly

### Activity Metrics
- **Lead Response Time**: <2 hours for hot leads
- **Lead-to-Opportunity Conversion**: 30%+ personal rate
- **Opportunity Progression**: Weekly stage advancement
- **Customer Touchpoints**: 5+ per opportunity per week

### Proposal Metrics
- **Proposal Win Rate**: 60%+ acceptance rate
- **Proposal Turnaround**: <48 hours from request
- **Proposal Value**: Accurate pricing and margins
- **Follow-up Rate**: 100% proposal follow-up within 3 days

## Pain Points and Solutions

### Pain Point 1: Lead Follow-up Management
**Challenge**: Difficulty tracking and prioritizing lead follow-ups
**Solution**: Systematic lead status management with clear follow-up workflows
**Feature**: `/apps/crm/leads` with status-based filtering and activity tracking

### Pain Point 2: Opportunity Stage Progression
**Challenge**: Unclear criteria for moving opportunities between stages
**Solution**: Visual Kanban board with defined stage criteria
**Feature**: `/apps/crm/opportunities` Kanban view with drag-and-drop progression

### Pain Point 3: Proposal Creation Efficiency
**Challenge**: Time-consuming proposal creation process
**Solution**: Template-based proposal generation with line item management
**Feature**: `/apps/crm/proposals` with automated proposal creation from opportunities

### Pain Point 4: Customer Relationship Visibility
**Challenge**: Limited visibility into account relationships and contact history
**Solution**: Comprehensive account and contact management with activity history
**Feature**: `/apps/crm/accounts` and `/apps/crm/contacts` with relationship mapping

### Pain Point 5: Pipeline Accuracy
**Challenge**: Inaccurate pipeline forecasting and stage management
**Solution**: Probability-based forecasting with regular pipeline reviews
**Feature**: `/apps/crm/opportunities/forecast` with weighted pipeline calculations

## Integration Points

### With Sales Manager
- **Pipeline Reviews**: Regular one-on-one pipeline discussions
- **Coaching Sessions**: Performance improvement and skill development
- **Forecast Updates**: Weekly forecast accuracy and updates
- **Deal Strategy**: Collaborative approach on high-value opportunities

### With Marketing Team
- **Lead Quality Feedback**: Regular feedback on lead source performance
- **Content Requests**: Sales enablement material needs
- **Campaign Insights**: Customer feedback on marketing messages
- **Event Coordination**: Trade show and event lead follow-up

### With Technical Teams
- **Solution Design**: Technical requirements gathering
- **Demo Coordination**: Product demonstration scheduling
- **Implementation Planning**: Post-sale technical coordination
- **Customer Support**: Technical issue escalation

### With Customer Success
- **Account Handoff**: Smooth transition from sales to success
- **Expansion Opportunities**: Upsell and cross-sell identification
- **Customer Health**: Account health monitoring and intervention
- **Renewal Planning**: Contract renewal preparation

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-27  
**Phase Coverage**: Phase 1 CRM (Phases 1.1-1.8)  
**Status**: Active - reflects current Phase 1 implementation
