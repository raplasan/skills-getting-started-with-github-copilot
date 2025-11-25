document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear la lista de participantes
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `
                  <li>
                    <span>${p}</span>
                    <span class="delete-icon" title="Eliminar" data-activity="${name}" data-email="${p}">&#128465;</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <p class="no-participants">Nadie inscrito aún.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Agregar event listener para íconos de eliminar
        setTimeout(() => {
          const deleteIcons = activityCard.querySelectorAll('.delete-icon');
          deleteIcons.forEach(icon => {
            icon.addEventListener('click', async (e) => {
              const activityName = icon.getAttribute('data-activity');
              const email = icon.getAttribute('data-email');
              if (confirm(`¿Eliminar a ${email} de ${activityName}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`, {
                    method: 'DELETE'
                  });
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message;
                    messageDiv.className = "success";
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || "Error al eliminar participante";
                    messageDiv.className = "error";
                  }
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => {
                    messageDiv.classList.add("hidden");
                  }, 5000);
                } catch (error) {
                  messageDiv.textContent = "No se pudo eliminar. Intenta de nuevo.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => {
                    messageDiv.classList.add("hidden");
                  }, 5000);
                }
              }
            });
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Actualiza la lista de actividades
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
