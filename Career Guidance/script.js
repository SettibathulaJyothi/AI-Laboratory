
const careerData = {

    after10: {
        title: "📚 What can you do after 10th?",
        description:
            "There are several pathways after Class 10. Explore them and understand where each path can lead.",

        options: [

            {
                icon: "🎓",
                title: "Intermediate",
                description: "Choose Science, Commerce or Humanities.",
                details: {
                    about: "Intermediate is a common pathway for students who want to continue academic education.",
                    courses: [
                        "MPC – Mathematics, Physics, Chemistry",
                        "BiPC – Biology, Physics, Chemistry",
                        "CEC – Civics, Economics, Commerce",
                        "MEC – Mathematics, Economics, Commerce",
                        "Humanities / Arts"
                    ],
                    careers: [
                        "Engineering",
                        "Medicine",
                        "Computer Science",
                        "Commerce",
                        "Management",
                        "Teaching",
                        "Civil Services"
                    ],
                    next: "After Intermediate → Degree / B.Tech / Professional courses / Higher education"
                }
            },

            {
                icon: "🛠️",
                title: "Diploma",
                description: "Build technical skills through diploma education.",
                details: {
                    about: "Diploma programs provide practical and technical education in specific fields.",
                    courses: [
                        "Diploma in Computer Engineering",
                        "Diploma in Mechanical Engineering",
                        "Diploma in Civil Engineering",
                        "Diploma in Electrical Engineering",
                        "Diploma in Electronics",
                        "Diploma in Automobile Engineering"
                    ],
                    careers: [
                        "Technician",
                        "Junior Engineer",
                        "Technical Assistant",
                        "CAD Designer",
                        "Maintenance Technician",
                        "IT Support"
                    ],
                    next: "After Diploma → Jobs / B.Tech through appropriate entry pathways / Higher studies"
                }
            },

            {
                icon: "🔧",
                title: "Vocational Education",
                description: "Learn practical skills for specific occupations.",
                details: {
                    about: "Vocational education focuses strongly on practical and job-related skills.",
                    courses: [
                        "Computer Applications",
                        "Electrician",
                        "Automobile",
                        "Healthcare",
                        "Retail",
                        "Beauty & Wellness",
                        "Agriculture"
                    ],
                    careers: [
                        "Technician",
                        "Operator",
                        "Assistant",
                        "Service Professional",
                        "Skilled Worker",
                        "Entrepreneur"
                    ],
                    next: "Vocational training → Skill development → Employment / Further training"
                }
            }

        ]
    },


    inter: {
        title: "🎓 What can you do after Intermediate?",
        description:
            "Choose a field based on your interests, strengths and career goals.",

        options: [

            {
                icon: "💻",
                title: "Engineering / B.Tech",
                description: "Explore technology and engineering fields.",
                details: {
                    about: "Engineering combines mathematics, science and technology to solve real-world problems.",
                    courses: [
                        "Computer Science Engineering",
                        "Artificial Intelligence & Machine Learning",
                        "Electronics & Communication",
                        "Electrical Engineering",
                        "Mechanical Engineering",
                        "Civil Engineering"
                    ],
                    careers: [
                        "Software Developer",
                        "AI/ML Engineer",
                        "Data Professional",
                        "Web Developer",
                        "Electronics Engineer",
                        "Design Engineer"
                    ],
                    next: "B.Tech → Jobs / M.Tech / MBA / Research / Entrepreneurship"
                }
            },

            {
                icon: "🩺",
                title: "Medical & Health Sciences",
                description: "Explore healthcare and life-science careers.",
                details: {
                    about: "Healthcare offers many educational pathways beyond medicine alone.",
                    courses: [
                        "Medicine",
                        "Dentistry",
                        "Pharmacy",
                        "Nursing",
                        "Physiotherapy",
                        "Allied Health Sciences"
                    ],
                    careers: [
                        "Doctor",
                        "Dentist",
                        "Pharmacist",
                        "Nurse",
                        "Physiotherapist",
                        "Healthcare Professional"
                    ],
                    next: "Professional course → Higher specialization / Employment / Further education"
                }
            },

            {
                icon: "📊",
                title: "Commerce & Management",
                description: "Explore business, finance and management.",
                details: {
                    about: "Commerce and management focus on business, finance, accounting and organizations.",
                    courses: [
                        "B.Com",
                        "BBA",
                        "Economics",
                        "Finance",
                        "Accounting",
                        "Business Administration"
                    ],
                    careers: [
                        "Accountant",
                        "Financial Analyst",
                        "Business Analyst",
                        "Manager",
                        "Entrepreneur",
                        "Banking Professional"
                    ],
                    next: "Degree → MBA / Professional certifications / Jobs / Entrepreneurship"
                }
            },

            {
                icon: "🎨",
                title: "Arts & Humanities",
                description: "Explore languages, society, culture and creative fields.",
                details: {
                    about: "Arts and humanities develop communication, analytical, cultural and creative skills.",
                    courses: [
                        "BA",
                        "Psychology",
                        "History",
                        "Political Science",
                        "English",
                        "Journalism & Mass Communication"
                    ],
                    careers: [
                        "Teacher",
                        "Writer",
                        "Journalist",
                        "Content Professional",
                        "Researcher",
                        "Public Administration"
                    ],
                    next: "Degree → Master's / Professional courses / Jobs / Research"
                }
            },

            {
                icon: "⚖️",
                title: "Law",
                description: "Explore legal education and careers.",
                details: {
                    about: "Law education develops knowledge of legal systems, rights, responsibilities and regulations.",
                    courses: [
                        "Integrated Law Programs",
                        "LLB",
                        "Legal Studies",
                        "Constitutional Law",
                        "Corporate Law"
                    ],
                    careers: [
                        "Lawyer",
                        "Legal Advisor",
                        "Legal Assistant",
                        "Corporate Legal Professional",
                        "Legal Researcher"
                    ],
                    next: "Law education → Legal practice / Corporate roles / Higher legal studies"
                }
            }

        ]
    },


    degree: {
        title: "🚀 What can you do after Degree / B.Tech?",
        description:
            "Your graduation is not the end. You can work, specialize or continue your education.",

        options: [

            {
                icon: "💼",
                title: "Start a Job",
                description: "Apply your skills in industry and organizations.",
                details: {
                    about: "Graduates can enter employment in areas related to their education and skills.",
                    courses: [
                        "Technical Jobs",
                        "Software Jobs",
                        "Business Roles",
                        "Teaching",
                        "Government Opportunities",
                        "Research Assistant Roles"
                    ],
                    careers: [
                        "Software Developer",
                        "Engineer",
                        "Analyst",
                        "Teacher",
                        "Manager",
                        "Research Assistant"
                    ],
                    next: "Job → Experience → Specialization / Leadership / Further education"
                }
            },

            {
                icon: "🎓",
                title: "Higher Education",
                description: "Continue studying and specialize in a field.",
                details: {
                    about: "Higher education can help students develop advanced knowledge and specialization.",
                    courses: [
                        "M.Tech",
                        "M.E.",
                        "M.Sc",
                        "MBA",
                        "MCA",
                        "Master's Programs"
                    ],
                    careers: [
                        "Specialist",
                        "Researcher",
                        "Professor / Academic roles",
                        "Technical Professional",
                        "Manager",
                        "Consultant"
                    ],
                    next: "Master's → Research / Jobs / Doctoral studies"
                }
            },

            {
                icon: "🔬",
                title: "Research & PhD",
                description: "Explore advanced research and innovation.",
                details: {
                    about: "Research pathways are suitable for students interested in creating new knowledge and solving complex problems.",
                    courses: [
                        "Master's Degree",
                        "Research Programs",
                        "M.Phil where applicable",
                        "PhD",
                        "Postdoctoral Research"
                    ],
                    careers: [
                        "Researcher",
                        "Scientist",
                        "Professor",
                        "R&D Professional",
                        "Research Engineer"
                    ],
                    next: "Research → Publications → Academic / R&D / Innovation careers"
                }
            },

            {
                icon: "🚀",
                title: "Entrepreneurship",
                description: "Turn an idea into a product, service or business.",
                details: {
                    about: "Entrepreneurship allows graduates to create and develop their own ventures.",
                    courses: [
                        "Business Management",
                        "Entrepreneurship",
                        "Finance",
                        "Marketing",
                        "Product Development",
                        "Startup Skills"
                    ],
                    careers: [
                        "Founder",
                        "Entrepreneur",
                        "Startup Professional",
                        "Business Consultant",
                        "Product Manager"
                    ],
                    next: "Idea → Prototype → Business → Growth"
                }
            }

        ]
    }

};


/* SHOW MAIN PATH */

function showPath(path) {

    const data = careerData[path];

    document.getElementById("pathSection").classList.remove("hidden");
    document.getElementById("detailsSection").classList.add("hidden");

    document.getElementById("pathTitle").textContent = data.title;
    document.getElementById("pathDescription").textContent = data.description;

    const container = document.getElementById("optionsContainer");

    container.innerHTML = "";

    data.options.forEach((option, index) => {

        const div = document.createElement("div");

        div.className = "option";

        div.innerHTML = `
            <div class="option-icon">${option.icon}</div>
            <h3>${option.title}</h3>
            <p>${option.description}</p>
        `;

        div.onclick = function () {
            showDetails(option);
        };

        container.appendChild(div);
    });

    document.getElementById("pathSection").scrollIntoView({
        behavior: "smooth"
    });
}


/* SHOW DETAILS */

function showDetails(option) {

    const details = option.details;

    const detailsSection = document.getElementById("detailsSection");

    detailsSection.classList.remove("hidden");

    detailsSection.innerHTML = `
        <button class="back-btn" onclick="closeDetails()">← Back</button>

        <div class="details-content">

            <h2>${option.icon} ${option.title}</h2>

            <h3>💡 About this path</h3>
            <p>${details.about}</p>

            <h3>📚 Courses / Areas</h3>

            <div class="career-list">
                ${details.courses.map(course =>
                    `<div class="career-item">📘 ${course}</div>`
                ).join("")}
            </div>

            <h3>💼 Possible Career Areas</h3>

            <div class="career-list">
                ${details.careers.map(career =>
                    `<div class="career-item">🌟 ${career}</div>`
                ).join("")}
            </div>

            <h3>🧭 What next?</h3>

            <div class="career-item">
                ${details.next}
            </div>

        </div>
    `;

    detailsSection.scrollIntoView({
        behavior: "smooth"
    });
}


/* BACK */

function closeDetails() {

    document.getElementById("detailsSection").classList.add("hidden");

    document.getElementById("pathSection").scrollIntoView({
        behavior: "smooth"
    });
}


function goBack() {

    document.getElementById("pathSection").classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

