const express = require('express');
const router = express.Router();

// Mock user repayment schedules
const mockUserSchedules = {
  '0x1234567890123456789012345678901234567890': {
    autoRepayEnabled: true,
    schedules: [
      {
        scheduleId: '0x1234567890123456789012345678901234567890123456789012345678901234',
        loanId: '0x1234567890123456789012345678901234567890123456789012345678901234',
        lstToken: 'stETH',
        frequency: 'daily', // daily, weekly, monthly
        nextExecution: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        lastExecution: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'active'
      },
      {
        scheduleId: '0x5678901234567890123456789012345678901234567890123456789012345678',
        loanId: '0x5678901234567890123456789012345678901234567890123456789012345678',
        lstToken: 'rETH',
        frequency: 'weekly',
        nextExecution: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
        lastExecution: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
        status: 'active'
      }
    ]
  }
};

/**
 * @route POST /api/v1/scheduler/setup-auto-repay
 * @desc Setup automatic repayment schedule
 */
router.post('/setup-auto-repay', (req, res) => {
  try {
    const { userAddress, loanId, lstToken, frequency } = req.body;
    
    if (!userAddress || !loanId || !lstToken || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userAddress, loanId, lstToken, frequency'
      });
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency. Must be daily, weekly, or monthly'
      });
    }

    // Create new schedule
    const scheduleId = '0x' + Math.random().toString(16).substr(2, 64);
    const schedule = {
      scheduleId,
      loanId,
      lstToken,
      frequency,
      nextExecution: new Date(Date.now() + 86400000).toISOString(), // Default to 1 day from now
      lastExecution: null,
      status: 'active'
    };

    // Add to user schedules
    if (!mockUserSchedules[userAddress]) {
      mockUserSchedules[userAddress] = {
        autoRepayEnabled: true,
        schedules: []
      };
    }

    mockUserSchedules[userAddress].schedules.push(schedule);

    res.json({
      success: true,
      message: 'Automatic repayment schedule created successfully',
      data: {
        scheduleId,
        userAddress,
        loanId,
        lstToken,
        frequency,
        nextExecution: schedule.nextExecution
      }
    });
  } catch (error) {
    console.error('Error setting up auto-repay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup auto-repay',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/scheduler/user-schedules/:address
 * @desc Get user's repayment schedules
 */
router.get('/user-schedules/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    const userSchedules = mockUserSchedules[address] || {
      autoRepayEnabled: false,
      schedules: []
    };

    res.json({
      success: true,
      data: {
        address,
        autoRepayEnabled: userSchedules.autoRepayEnabled,
        schedules: userSchedules.schedules,
        totalSchedules: userSchedules.schedules.length,
        activeSchedules: userSchedules.schedules.filter(s => s.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Error getting user schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user schedules',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v1/scheduler/update-schedule/:scheduleId
 * @desc Update existing repayment schedule
 */
router.put('/update-schedule/:scheduleId', (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { frequency, status } = req.body;
    
    // Find and update schedule
    let scheduleFound = false;
    for (const userAddress in mockUserSchedules) {
      const userSchedules = mockUserSchedules[userAddress];
      const scheduleIndex = userSchedules.schedules.findIndex(s => s.scheduleId === scheduleId);
      
      if (scheduleIndex !== -1) {
        if (frequency) {
          userSchedules.schedules[scheduleIndex].frequency = frequency;
        }
        if (status) {
          userSchedules.schedules[scheduleIndex].status = status;
        }
        scheduleFound = true;
        break;
      }
    }

    if (!scheduleFound) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        scheduleId,
        frequency,
        status
      }
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v1/scheduler/delete-schedule/:scheduleId
 * @desc Delete repayment schedule
 */
router.delete('/delete-schedule/:scheduleId', (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Find and delete schedule
    let scheduleFound = false;
    for (const userAddress in mockUserSchedules) {
      const userSchedules = mockUserSchedules[userAddress];
      const scheduleIndex = userSchedules.schedules.findIndex(s => s.scheduleId === scheduleId);
      
      if (scheduleIndex !== -1) {
        userSchedules.schedules.splice(scheduleIndex, 1);
        scheduleFound = true;
        break;
      }
    }

    if (!scheduleFound) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
      data: {
        scheduleId
      }
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/scheduler/execute-schedule/:scheduleId
 * @desc Manually execute a scheduled repayment
 */
router.post('/execute-schedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Find schedule
    let schedule = null;
    let userAddress = null;
    
    for (const addr in mockUserSchedules) {
      const userSchedules = mockUserSchedules[addr];
      const foundSchedule = userSchedules.schedules.find(s => s.scheduleId === scheduleId);
      
      if (foundSchedule) {
        schedule = foundSchedule;
        userAddress = addr;
        break;
      }
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Simulate execution
    schedule.lastExecution = new Date().toISOString();
    
    // Calculate next execution based on frequency
    const now = new Date();
    let nextExecution;
    
    switch (schedule.frequency) {
      case 'daily':
        nextExecution = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextExecution = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextExecution = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextExecution = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    
    schedule.nextExecution = nextExecution.toISOString();

    res.json({
      success: true,
      message: 'Schedule executed successfully',
      data: {
        scheduleId,
        userAddress,
        loanId: schedule.loanId,
        lstToken: schedule.lstToken,
        executedAt: schedule.lastExecution,
        nextExecution: schedule.nextExecution
      }
    });
  } catch (error) {
    console.error('Error executing schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute schedule',
      error: error.message
    });
  }
});

module.exports = router; 