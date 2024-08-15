let sessions = [];
let selectedUser = '';
let isRefreshing = false;
let startY = 0;
let pullDistance = 0;
const REFRESH_THRESHOLD = 100; // pixels
let activeViewer = null;


fetchSessions();
setupEventListeners();

function fetchSessions() {
    const corsOptions = {
        method: 'GET',
        mode: 'cors', // Enable CORS
        credentials: 'include', // Include cookies in the request
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers required by the API
            // 'Authorization': 'Bearer YOUR_TOKEN_HERE', // Uncomment and add token if required
        }
    };

    fetch("https://api.resonite.com/sessions", corsOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            sessions = data;
            renderSessions(sessions);
            populateUserDropdown(sessions);
        })
        .catch(error => {
            console.error("Error fetching sessions:", error);
            // You might want to update the UI to show the error to the user
            document.getElementById('sessionsContainer').innerHTML = `<div class="error">Error fetching sessions: ${error.message}</div>`;
        });
}

function popsessions(error, reply) {
    if (error) {
        console.error("Error fetching sessions:", error);
        return;
    }
    sessions = JSON.parse(reply);
    renderSessions(sessions);
    populateUserDropdown(sessions);
}

function renderSessions(sessionsToRender) {
    const container = document.getElementById('sessionsContainer');
    container.innerHTML = sessionsToRender.map(createSessionHTML).join('');
    
    // Add click event listeners to thumbnail containers
    document.querySelectorAll('.thumbnail-container').forEach(container => {
        container.addEventListener('click', function() {
            initializeViewer(this);
        });
    });
}

function initializeViewer(container) {
    // Safely dispose of the previous viewer if it exists
    if (activeViewer && typeof activeViewer.dispose === 'function') {
        activeViewer.dispose();
        activeViewer = null;
    }

    // Create a new viewer for the clicked thumbnail
    const thumbnailUrl = container.dataset.thumbnail;
    try {
        activeViewer = new Viewer360(thumbnailUrl, container);
        
        // Hide the static thumbnail
        const staticThumbnail = container.querySelector('.static-thumbnail');
        if (staticThumbnail) {
            staticThumbnail.style.display = 'none';
        }
    } catch (error) {
        console.error("Error initializing 360 viewer:", error);
        // Optionally, you can show an error message to the user here
    }
}

function createSessionHTML(data) {
    return `
    <details data-host="${data.hostUsername}" data-users="${data.sessionUsers.map(user => user.username).join(',')}">
        <summary>${data.name} by ${data.hostUsername}</summary>
        <div class="thumbnail-container" data-thumbnail="${data.thumbnailUrl}">
            <img src="${data.thumbnailUrl}" alt="${data.name} Thumbnail" class="static-thumbnail">
        </div>
        <ul>
            <li><strong>Session Name:</strong> ${data.name}</li>
            <li><strong>Host Username:</strong> ${data.hostUsername}</li>
            <li><strong>Session ID:</strong> ${data.sessionId}</li>
            <li><strong>Host User ID:</strong> ${data.hostUserId}</li>
            <li><strong>App Version:</strong> ${data.appVersion}</li>
            <li><strong>Headless Host:</strong> ${data.headlessHost}</li>
            <li><strong>Session URLs:</strong></li>
            <ul>
                ${data.sessionURLs.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}
            </ul>
            <li><strong>Session Users:</strong></li>
            <ul>
                ${data.sessionUsers.map(user => `<li class="clickable-username" data-username="${user.username}">${user.username} (Present: ${user.isPresent})</li>`).join('')}
            </ul>
            <li><strong>Max Users:</strong> ${data.maxUsers}</li>
            <li><strong>Mobile Friendly:</strong> ${data.mobileFriendly}</li>
            <li><strong>Session Begin Time:</strong> ${data.sessionBeginTime}</li>
            <li><strong>Last Update:</strong> ${data.lastUpdate}</li>
            <li><strong>Access Level:</strong> ${data.accessLevel}</li>
            <li><strong>Hide From Listing:</strong> ${data.hideFromListing}</li>
            <li><strong>Session Ended:</strong> ${data.hasEnded}</li>
            <li><strong>Session Valid:</strong> ${data.isValid}</li>
        </ul>
    </details>
    `;
}

function populateUserDropdown(sessions) {
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.innerHTML = '<option value="">-- All Users --</option>';
    
    const users = new Set();
    const headlessAccounts = new Set();

    sessions.forEach(session => {
        if (session.headlessHost) {
            headlessAccounts.add(session.hostUsername);
        }
        session.sessionUsers.forEach(user => users.add(user.username));
    });

    // Filter out headless accounts from the users set
    const filteredUsers = Array.from(users).filter(user => !headlessAccounts.has(user));

    // Sort the filtered users alphabetically
    filteredUsers.sort((a, b) => a.localeCompare(b));

    filteredUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        userDropdown.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('filterInput').addEventListener('input', function(e) {
        selectedUser = e.target.value;
        document.getElementById('userDropdown').value = selectedUser;
        filterSessions();
    });
    document.getElementById('nameFilterInput').addEventListener('input', filterSessions);
    document.getElementById('userDropdown').addEventListener('change', function(e) {
        selectedUser = e.target.value;
        document.getElementById('filterInput').value = selectedUser;
        filterSessions();
    });
    document.getElementById('emptyHeadlessToggle').addEventListener('change', filterSessions);
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('clickable-username')) {
            selectedUser = e.target.dataset.username;
            document.getElementById('userDropdown').value = selectedUser;
            document.getElementById('filterInput').value = selectedUser;
            filterSessions();
        }
    });
    document.querySelectorAll('.thumbnail-container').forEach(container => {
        container.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the details from toggling if it's a child of <details>
            initializeViewer(this);
        });
    });
    const sessionsContainer = document.getElementById('sessionsContainer');
    sessionsContainer.addEventListener('mousedown', startPull);
    sessionsContainer.addEventListener('mousemove', pull);
    sessionsContainer.addEventListener('mouseup', endPull);
    sessionsContainer.addEventListener('mouseleave', endPull);

    sessionsContainer.addEventListener('touchstart', startPull);
    sessionsContainer.addEventListener('touchmove', pull);
    sessionsContainer.addEventListener('touchend', endPull);
}

function startPull(e) {
    startY = e.pageY || e.touches[0].pageY;
    isRefreshing = false;
    pullDistance = 0;
}

function pull(e) {
    if (isRefreshing) return;

    const y = e.pageY || e.touches[0].pageY;
    pullDistance = y - startY;

    if (pullDistance > 0 && pullDistance <= REFRESH_THRESHOLD) {
        document.getElementById('sessionsContainer').style.transform = `translateY(${pullDistance}px)`;
    }
}

function endPull() {
    const container = document.getElementById('sessionsContainer');
    container.style.transition = 'transform 0.3s ease-out';
    container.style.transform = 'translateY(0)';

    if (pullDistance > REFRESH_THRESHOLD) {
        isRefreshing = true;
        container.innerHTML = '<div class="loading">Refreshing...</div>';
        fetchSessions();
    }

    setTimeout(() => {
        container.style.transition = '';
    }, 300);

    pullDistance = 0;
}

function filterSessions() {
    const usernameFilter = document.getElementById('filterInput').value.toLowerCase();
    const nameFilter = document.getElementById('nameFilterInput').value.toLowerCase();
    const filterEmptyHeadless = document.getElementById('emptyHeadlessToggle').checked;

    const filteredSessions = sessions.filter(session => {
        const matchesUsername = session.hostUsername.toLowerCase().includes(usernameFilter) ||
                                session.sessionUsers.some(user => user.username.toLowerCase().includes(usernameFilter));
        const matchesName = session.name.toLowerCase().includes(nameFilter);
        
        // Check if it's an empty headless session
        const isEmptyHeadless = session.headlessHost &&
                                (session.sessionUsers.length === 0 ||
                                 (session.sessionUsers.length === 1 && 
                                  session.sessionUsers[0].username === session.hostUsername));

        // If filtering empty headless sessions, exclude them
        const shouldInclude = !filterEmptyHeadless || !isEmptyHeadless;

        return matchesUsername && matchesName && shouldInclude;
    });

    renderSessions(filteredSessions);
}
