document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tabPanel');
    const underwriterIdInput = document.getElementById('underwriterId');
    const passwordInput = document.getElementById('defaultPassword');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(target).classList.add('active');

            if (target === 'underwriter-registration') {
                generateUnderwriterId();
                generatePassword();
            }
        });
    });

    console.log("DOM Loaded");

    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', handleAuth);

    const defaultAdmin = {
        username: "admin",
        password: "admin123"
    };

    function handleAuth() {
        console.log("handle auth");
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log("username", username);
        console.log("password", password);

        if (username === defaultAdmin.username && password === defaultAdmin.password) {
            console.log("Admin");
            showAdminDashboard();
        } else {
            // Check if the username and password match an underwriter in local storage
            const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            const validUnderwriter = underwriters.find(uw => uw.underwriterId === username && uw.password === password);

            if (validUnderwriter) {
                console.log("User");
                showUserDashboard();
            } else {
                console.log("invalid");
                alert("Invalid credentials. Please contact admin to register or try again.");
            }
        }
    }

    function showAdminDashboard() {
        console.log("Showing Admin Dashboard");
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
    }

    function showUserDashboard() {
        console.log("Showing User Dashboard");
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('user-dashboard').classList.remove('hidden');
    }

    function generateUnderwriterId() {
        const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 random digits
        const underwriterId = `UW24${randomDigits}`;
        underwriterIdInput.value = underwriterId;
    }

    function generatePassword() {
        const length = 8;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        // Ensure at least one special character
        if (!/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) {
            const specialChar = charset.charAt(Math.floor(Math.random() * 16) + 62); // Choose a special character
            password = password.slice(0, 6) + specialChar + password.slice(7);
        }

        // Ensure password is of the correct length
        if (password.length < length) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        console.log("Generated Password:", password); // Debugging line
        passwordInput.value = password;
    }

    document.getElementById('underwriter-form').addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate the form
        const underwriterId = document.getElementById('underwriterId').value;
        const name = document.getElementById('name').value;
        const dob = document.getElementById('dob').value;
        const joiningDate = document.getElementById('joiningDate').value;
        const password = document.getElementById('defaultPassword').value;

        if (!underwriterId || !name || !dob || !joiningDate || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Save to local storage
        let underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
        const newUnderwriter = {
            underwriterId,
            name,
            dob,
            joiningDate,
            password
        };

        underwriters.push(newUnderwriter);
        localStorage.setItem('underwriters', JSON.stringify(underwriters));

        alert('Underwriter registered successfully!');
        e.target.reset();
        generateUnderwriterId(); // Generate new ID for the next entry
        generatePassword(); // Generate new password for the next entry
    });

    document.getElementById('search-button').addEventListener('click', function () {
        const searchId = document.getElementById('search-id').value;
        const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
        const result = underwriters.find(u => u.underwriterId === searchId);
        const searchResultContainer = document.getElementById('search-result');

        searchResultContainer.innerHTML = '';

        if (result) {
            const underwriterCard = `
            <div class="card">
                <h3>${result.name}</h3>
                <p><strong>Underwriter ID:</strong> ${result.underwriterId}</p>
                <p><strong>Date of Birth:</strong> ${result.dob}</p>
                <p><strong>Joining Date:</strong> ${result.joiningDate}</p>
            </div>
        `;
            searchResultContainer.innerHTML = underwriterCard;
        } else {
            searchResultContainer.innerHTML = '<p>Underwriter not found.</p>';
        }
    });


    document.getElementById('update-button').addEventListener('click', function () {
        const updateId = document.getElementById('update-id').value;
        const newPassword = document.getElementById('new-password').value;
        const updateResultContainer = document.getElementById('update-result');

        // Clear any previous results
        updateResultContainer.innerHTML = '';

        // Validate input fields
        if (!updateId || !newPassword) {
            alert('Please fill in all fields.');
            return;
        }

        // Validate password
        if (!isValidPassword(newPassword)) {
            alert('Password must be at least 8 characters long and contain at least one special character.');
            return;
        }

        // Fetch underwriters from local storage
        const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
        const underwriter = underwriters.find(u => u.underwriterId === updateId);

        // Update password if underwriter is found
        if (underwriter) {
            underwriter.password = newPassword;
            localStorage.setItem('underwriters', JSON.stringify(underwriters));

            // Display result in a card
            updateResultContainer.innerHTML = `
            <div class="updateCard">
                <h3>${underwriter.name}</h3>
                <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
                <p><strong>New Password:</strong> ${newPassword}</p>
            </div>
        `;
            alert('Password updated successfully!');
        } else {
            updateResultContainer.innerHTML = '<p>Underwriter not found.</p>';
        }
    });

    // Function to validate password
    function isValidPassword(password) {
        const minLength = 8;
        const specialCharRegex = /[!@#$%^&*()_+[\]{}|;:,.<>?]/;
        return password.length >= minLength && specialCharRegex.test(password);
    }


    document.getElementById('delete-button').addEventListener('click', function () {
        const deleteId = document.getElementById('delete-id').value;
        const deleteResultContainer = document.getElementById('delete-result');

        // Clear previous results
        deleteResultContainer.innerHTML = '';

        if (!deleteId) {
            alert('Please enter an Underwriter ID.');
            return;
        }

        // Fetch underwriters from local storage
        const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
        const underwriter = underwriters.find(u => u.underwriterId === deleteId);

        // Display result if underwriter is found
        if (underwriter) {
            deleteResultContainer.innerHTML = `
            <div class="card">
                <h3>${underwriter.name}</h3>
                <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
                <p><strong>Date of Birth:</strong> ${underwriter.dob}</p>
                <p><strong>Joining Date:</strong> ${underwriter.joiningDate}</p>
                <p><strong>Password:</strong> ${underwriter.password}</p>
                <button class="delete-button" data-id="${underwriter.underwriterId}">Delete</button>
            </div>
        `;

            // Add event listener to delete button
            document.querySelector('.delete-button').addEventListener('click', function () {
                const underwriterIdToDelete = this.getAttribute('data-id');

                if (confirm('Are you sure you want to delete this underwriter?')) {
                    // Delete the underwriter
                    const updatedUnderwriters = underwriters.filter(u => u.underwriterId !== underwriterIdToDelete);
                    localStorage.setItem('underwriters', JSON.stringify(updatedUnderwriters));

                    alert('Underwriter deleted successfully!');
                    deleteResultContainer.innerHTML = ''; // Clear the result
                }
            });
        } else {
            deleteResultContainer.innerHTML = '<p>Underwriter not found.</p>';
        }
    });


    // document.getElementById('view-all-button').addEventListener('click', function () {
    //     const viewAllContainer = document.getElementById('view-all-container');
    //     viewAllContainer.innerHTML = ''; // Clear previous results

    //     // Fetch underwriters from local storage
    //     const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];

    //     // Create a card for each underwriter
    //     underwriters.forEach(underwriter => {
    //         const card = document.createElement('div');
    //         card.className = 'card';
    //         card.innerHTML = `
    //             <h3>${underwriter.name}</h3>
    //             <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
    //             <p><strong>Date of Birth:</strong> ${underwriter.dob}</p>
    //             <p><strong>Joining Date:</strong> ${underwriter.joiningDate}</p>
    //             <p><strong>Password:</strong> ${underwriter.password}</p>
    //         `;
    //         viewAllContainer.appendChild(card);
    //     });
    // });
    document.addEventListener('DOMContentLoaded', function () {
        const tabs = document.querySelectorAll('.tab');
        const tabPanes = document.querySelectorAll('.tabPanel');
        const underwriterIdInput = document.getElementById('underwriterId');
        const passwordInput = document.getElementById('defaultPassword');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const target = this.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                this.classList.add('active');
                document.getElementById(target).classList.add('active');

                if (target === 'underwriter-registration') {
                    generateUnderwriterId();
                    generatePassword();
                }
            });
        });

        console.log("DOM Loaded");

        const loginButton = document.getElementById('login-button');
        loginButton.addEventListener('click', handleAuth);

        const defaultAdmin = {
            username: "admin",
            password: "admin123"
        };

        function handleAuth() {
            console.log("handle auth");
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            console.log("username", username);
            console.log("password", password);

            if (username === defaultAdmin.username && password === defaultAdmin.password) {
                console.log("Admin");
                showAdminDashboard();
            } else {
                // Check if the username and password match an underwriter in local storage
                const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
                const validUnderwriter = underwriters.find(uw => uw.underwriterId === username && uw.password === password);

                if (validUnderwriter) {
                    console.log("User");
                    showUserDashboard();
                } else {
                    console.log("invalid");
                    alert("Invalid credentials. Please contact admin to register or try again.");
                }
            }
        }

        function showAdminDashboard() {
            console.log("Showing Admin Dashboard");
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
        }

        function showUserDashboard() {
            console.log("Showing User Dashboard");
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('user-dashboard').classList.remove('hidden');
        }

        function generateUnderwriterId() {
            const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 random digits
            const underwriterId = `UW24${randomDigits}`;
            underwriterIdInput.value = underwriterId;
        }

        function generatePassword() {
            const length = 8;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
            let password = "";
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }

            // Ensure at least one special character
            if (!/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) {
                const specialChar = charset.charAt(Math.floor(Math.random() * 16) + 62); // Choose a special character
                password = password.slice(0, 6) + specialChar + password.slice(7);
            }

            // Ensure password is of the correct length
            if (password.length < length) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }

            console.log("Generated Password:", password); // Debugging line
            passwordInput.value = password;
        }

        document.getElementById('underwriter-form').addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate the form
            const underwriterId = document.getElementById('underwriterId').value;
            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const joiningDate = document.getElementById('joiningDate').value;
            const password = document.getElementById('defaultPassword').value;

            if (!underwriterId || !name || !dob || !joiningDate || !password) {
                alert('Please fill in all fields.');
                return;
            }

            // Save to local storage
            let underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            const newUnderwriter = {
                underwriterId,
                name,
                dob,
                joiningDate,
                password
            };

            underwriters.push(newUnderwriter);
            localStorage.setItem('underwriters', JSON.stringify(underwriters));

            alert('Underwriter registered successfully!');
            e.target.reset();
            generateUnderwriterId(); // Generate new ID for the next entry
            generatePassword(); // Generate new password for the next entry
        });

        document.getElementById('search-button').addEventListener('click', function () {
            const searchId = document.getElementById('search-id').value;
            const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            const result = underwriters.find(u => u.underwriterId === searchId);
            const searchResultContainer = document.getElementById('search-result');

            searchResultContainer.innerHTML = '';

            if (result) {
                const underwriterCard = `
            <div class="card">
                <h3>${result.name}</h3>
                <p><strong>Underwriter ID:</strong> ${result.underwriterId}</p>
                <p><strong>Date of Birth:</strong> ${result.dob}</p>
                <p><strong>Joining Date:</strong> ${result.joiningDate}</p>
            </div>
        `;
                searchResultContainer.innerHTML = underwriterCard;
            } else {
                searchResultContainer.innerHTML = '<p>Underwriter not found.</p>';
            }
        });


        document.getElementById('update-button').addEventListener('click', function () {
            const updateId = document.getElementById('update-id').value;
            const newPassword = document.getElementById('new-password').value;
            const updateResultContainer = document.getElementById('update-result');

            // Clear any previous results
            updateResultContainer.innerHTML = '';

            // Validate input fields
            if (!updateId || !newPassword) {
                alert('Please fill in all fields.');
                return;
            }

            // Validate password
            if (!isValidPassword(newPassword)) {
                alert('Password must be at least 8 characters long and contain at least one special character.');
                return;
            }

            // Fetch underwriters from local storage
            const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            const underwriter = underwriters.find(u => u.underwriterId === updateId);

            // Update password if underwriter is found
            if (underwriter) {
                underwriter.password = newPassword;
                localStorage.setItem('underwriters', JSON.stringify(underwriters));

                // Display result in a card
                updateResultContainer.innerHTML = `
            <div class="updateCard">
                <h3>${underwriter.name}</h3>
                <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
                <p><strong>New Password:</strong> ${newPassword}</p>
            </div>
        `;
                alert('Password updated successfully!');
            } else {
                updateResultContainer.innerHTML = '<p>Underwriter not found.</p>';
            }
        });

        // Function to validate password
        function isValidPassword(password) {
            const minLength = 8;
            const specialCharRegex = /[!@#$%^&*()_+[\]{}|;:,.<>?]/;
            return password.length >= minLength && specialCharRegex.test(password);
        }


        document.getElementById('delete-button').addEventListener('click', function () {
            const deleteId = document.getElementById('delete-id').value;
            const deleteResultContainer = document.getElementById('delete-result');

            // Clear previous results
            deleteResultContainer.innerHTML = '';

            if (!deleteId) {
                alert('Please enter an Underwriter ID.');
                return;
            }

            // Fetch underwriters from local storage
            const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            const underwriter = underwriters.find(u => u.underwriterId === deleteId);

            // Display result if underwriter is found
            if (underwriter) {
                deleteResultContainer.innerHTML = `
            <div class="card">
                <h3>${underwriter.name}</h3>
                <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
                <p><strong>Date of Birth:</strong> ${underwriter.dob}</p>
                <p><strong>Joining Date:</strong> ${underwriter.joiningDate}</p>
                <p><strong>Password:</strong> ${underwriter.password}</p>
                <button class="delete-button" data-id="${underwriter.underwriterId}">Delete</button>
            </div>
        `;

                // Add event listener to delete button
                document.querySelector('.delete-button').addEventListener('click', function () {
                    const underwriterIdToDelete = this.getAttribute('data-id');

                    if (confirm('Are you sure you want to delete this underwriter?')) {
                        // Delete the underwriter
                        const updatedUnderwriters = underwriters.filter(u => u.underwriterId !== underwriterIdToDelete);
                        localStorage.setItem('underwriters', JSON.stringify(updatedUnderwriters));

                        alert('Underwriter deleted successfully!');
                        deleteResultContainer.innerHTML = ''; // Clear the result
                    }
                });
            } else {
                deleteResultContainer.innerHTML = '<p>Underwriter not found.</p>';
            }
        });


        document.getElementById('view-all-button').addEventListener('click', function () {
            console.log('View All button clicked');
            const viewAllContainer = document.getElementById('view-all-container');
            viewAllContainer.innerHTML = ''; // Clear previous results

            // Fetch underwriters from local storage
            const underwriters = JSON.parse(localStorage.getItem('underwriters')) || [];
            console.log('Fetched underwriters:', underwriters);

            // Create a card for each underwriter
            underwriters.forEach(underwriter => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                <h3>${underwriter.name}</h3>
                <p><strong>Underwriter ID:</strong> ${underwriter.underwriterId}</p>
                <p><strong>Date of Birth:</strong> ${underwriter.dob}</p>
                <p><strong>Joining Date:</strong> ${underwriter.joiningDate}</p>
                <p><strong>Password:</strong> ${underwriter.password}</p>
            `;
                viewAllContainer.appendChild(card);
            });
        });
    });

});
