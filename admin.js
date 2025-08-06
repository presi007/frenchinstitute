// Admin Dashboard JavaScript
let allStudents = [];
let filteredStudents = [];

// Load students on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    setupEventListeners();
});

// Setup event listeners for search and filter
function setupEventListeners() {
    const searchBox = document.getElementById('searchBox');
    const courseFilter = document.getElementById('courseFilter');
    const exportBtn = document.getElementById('exportBtn');
    
    searchBox.addEventListener('input', filterStudents);
    courseFilter.addEventListener('change', filterStudents);
    exportBtn.addEventListener('click', exportToCSV);
}

// Load students from backend
async function loadStudents() {
    try {
        const response = await fetch('http://localhost:3001/api/students');
        const data = await response.json();
        
        if (response.ok) {
            allStudents = data.students;
            filteredStudents = [...allStudents];
            displayStudents();
            updateStats();
        } else {
            showError('Failed to load students');
        }
    } catch (error) {
        showError('Could not connect to server');
        console.error('Error loading students:', error);
    }
}

// Display students in table
function displayStudents() {
    const tbody = document.getElementById('studentsTableBody');
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No students found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td><strong>${student.firstName} ${student.lastName}</strong></td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>
                <span class="course-badge badge-${getBadgeClass(student.courseLevel)}">
                    ${formatCourseLevel(student.courseLevel)}
                </span>
            </td>
            <td>${formatPreferredTime(student.preferredTime)}</td>
            <td>${student.message || '-'}</td>
            <td>${formatDate(student.created_at)}</td>
        </tr>
    `).join('');
}

// Filter students based on search and course filter
function filterStudents() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const courseFilter = document.getElementById('courseFilter').value;
    
    filteredStudents = allStudents.filter(student => {
        const matchesSearch = 
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.phone.includes(searchTerm);
        
        const matchesCourse = !courseFilter || student.courseLevel === courseFilter;
        
        return matchesSearch && matchesCourse;
    });
    
    displayStudents();
}

// Update statistics
function updateStats() {
    const totalStudents = allStudents.length;
    const thisMonth = allStudents.filter(student => {
        const studentDate = new Date(student.created_at);
        const now = new Date();
        return studentDate.getMonth() === now.getMonth() && 
               studentDate.getFullYear() === now.getFullYear();
    }).length;
    
    const beginnerCount = allStudents.filter(s => s.courseLevel === 'beginner').length;
    const intermediateCount = allStudents.filter(s => s.courseLevel === 'intermediate').length;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('thisMonth').textContent = thisMonth;
    document.getElementById('beginnerCount').textContent = beginnerCount;
    document.getElementById('intermediateCount').textContent = intermediateCount;
}

// Get badge class for course level
function getBadgeClass(courseLevel) {
    switch(courseLevel) {
        case 'beginner': return 'beginner';
        case 'intermediate': return 'intermediate';
        case 'advanced': return 'advanced';
        case 'exam-preparation': return 'exam';
        default: return 'beginner';
    }
}

// Format course level for display
function formatCourseLevel(courseLevel) {
    switch(courseLevel) {
        case 'beginner': return 'Beginner';
        case 'intermediate': return 'Intermediate';
        case 'advanced': return 'Advanced';
        case 'exam-preparation': return 'Exam Prep';
        default: return courseLevel;
    }
}

// Format preferred time for display
function formatPreferredTime(preferredTime) {
    switch(preferredTime) {
        case 'morning': return 'Morning (9 AM - 12 PM)';
        case 'afternoon': return 'Afternoon (2 PM - 5 PM)';
        case 'evening': return 'Evening (6 PM - 9 PM)';
        case 'weekend': return 'Weekend';
        default: return preferredTime;
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export to CSV
function exportToCSV() {
    if (filteredStudents.length === 0) {
        showError('No data to export');
        return;
    }
    
    const headers = ['Name', 'Email', 'Phone', 'Course Level', 'Preferred Time', 'Message', 'Enrolled Date'];
    const csvContent = [
        headers.join(','),
        ...filteredStudents.map(student => [
            `"${student.firstName} ${student.lastName}"`,
            `"${student.email}"`,
            `"${student.phone}"`,
            `"${formatCourseLevel(student.courseLevel)}"`,
            `"${formatPreferredTime(student.preferredTime)}"`,
            `"${student.message || ''}"`,
            `"${formatDate(student.created_at)}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `french-institute-students-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="no-data">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </td>
        </tr>
    `;
} 