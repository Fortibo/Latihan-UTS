if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js')
    console.log("Service Worker Registered")
}
let loading;
const apiUrl = "http://localhost:3000"
let user = JSON.parse(localStorage.getItem("user")) || null

document.addEventListener("DOMContentLoaded", () => {
    loading = document.querySelector("#loader");    
    let user = JSON.parse(localStorage.getItem("user")) || null
    if (user) {
        document.getElementById("login-form").classList.add("hidden")
        document.getElementById("posts").classList.remove("hidden")
        fetchPosts()
    }

})

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value
    console.log(username, password)
    try {
        let res = await fetch(apiUrl + "/users")
    let users = await res.json()
    if (!res.ok) {
        alert("Error fetching users / DB offline")
        return
    }
    let user = users.find(u => u.username === username && u.password === password)
    if (user) {
        localStorage.setItem("user", JSON.stringify(user))
        document.getElementById("login-form").classList.add("hidden")
        document.getElementById("posts").classList.remove("hidden")
        localStorage.setItem("user", JSON.stringify(user))
        fetchPosts()
    } else {

        
    }
    } catch (error) {
        console.error("Error logging in:", error)
        alert("Error logging in")
        return
    }
    
 })

 document.getElementById("add-post-form").addEventListener("submit", async (e) => {
     e.preventDefault()
         console.log("✅ Comment form submit detected, prevented default");
    if (loading) loading.classList.remove("hidden");
    let title = document.getElementById("post-title").value.trim()
     let content = document.getElementById("post-content").value.trim()
     console.log(title, content)
     if (!title || !content) return alert("Title and content are required")
     try {
         let post = {
        title,
        content,
        userId: user.id
     }
         let res = await fetch(apiUrl + "/posts", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(post)
            })
            if (!res.ok) throw new Error("Network response was not ok")
            } catch (error) {
        console.error("Error adding post:", error)
        alert("Error adding post")
        return
    }
    finally {
         document.getElementById("post-title").value = ""
         document.getElementById("post-content").value = ""
         if (loading) loading.classList.add("hidden");
        await fetchPosts()
     }
    
   
 })

document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("user")
    document.getElementById("login-form").classList.remove("hidden")
    document.getElementById("posts").classList.add("hidden")
 })
async function fetchPosts() {
   if (loading) loading.classList.remove("hidden");
let posts = [];
    try {
        let resPosts = await fetch(apiUrl + "/posts");

        let resCom = await fetch(apiUrl + "/comments");
        posts = await resPosts.json();
        console.log("posts:", posts);
        let comments = await resCom.json();
        if (!resPosts.ok || !resCom.ok) throw new Error("Network response was not ok");
        posts.forEach(post => {
            post.comments = comments.filter(comment => String(comment.postId) === String(post.id));
        });
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts(posts, resPosts);
    } catch (error) {
        showAPIWarning();
    } finally {
        if (loading) loading.classList.add("hidden");
    }
}

function renderPosts(posts, resPosts) {
    let postsContainer = document.getElementById("posts-container")

    postsContainer.innerHTML = ""
    console.log(resPosts)
    console.log(navigator.onLine)

    posts.forEach((p) => {
        const postDiv = document.createElement("div")
        postDiv.className = "bg-white p-4 rounded-lg shadow-md"
        postDiv.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${p.title}</h2>
            <p class="text-gray-700">${p.content}</p>
            <h3 class="text-lg font-semibold mt-4">Comments:</h3>
            <ul class="list-disc list-inside">
                ${(p.comments||[]).map(c => `<li>${c.body}</li>`).join("")}
            </ul>
            ${navigator.onLine && resPosts.ok ?
                ` <form class="mt-4 comment-form" data-post-id="${p.id}">
                    <input type="text" name="comment"  placeholder="Add a comment" class="border-2 border-black rounded-md p-1 w-full" required>
                    <button type="submit" class="bg-green-500 text-white p-1 rounded-md mt-2">Submit</button>
                </form>` :
                "<p class='text-center text-gray-500'>You are offline</p>"
            }

        `
        postsContainer.appendChild(postDiv)

        const commentForm = postDiv.querySelector(".comment-form")
        if (commentForm) {
            commentForm.addEventListener("submit", async (e) => {
                e.preventDefault()
                let postId = commentForm.getAttribute("data-post-id");
                let commentInput = commentForm.querySelector("input[name='comment']")
                let commentBody = commentInput.value.trim()
                if (!commentBody) return alert("Comment cannot be empty")
                let comment = {
                    body: commentBody,
                    postId: (postId)
                }
                commentInput.value = ""
                console.log(comment)
                let res = await fetch(apiUrl + "/comments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(comment)
                })
                if (!res.ok) {
                    alert("Error posting comment")
                    return

                }
                await fetchPosts()

            })
        }
    });
    
}

function showAPIWarning() {
    var post_doc = document.getElementById("add-post-container");
    var postsContainer = document.getElementById("add-post-form");
    var warning = document.getElementById("offline-post-warning");
    if (post_doc && postsContainer && warning) {
        post_doc.classList.add("hidden");
        postsContainer.classList.add("hidden");
        warning.textContent = "API/server tidak dapat diakses!";
        warning.classList.remove("hidden");
    }
}

function togglePost() {
    var post_doc = document.getElementById("add-post-container");
    var postsContainer = document.getElementById("add-post-form");
    var warning = document.getElementById("offline-post-warning");
    if (post_doc && postsContainer && warning) {
        if (navigator.onLine) {
            post_doc.classList.remove("hidden");
            postsContainer.classList.remove("hidden");
            warning.classList.add("hidden");
        } else {
            post_doc.classList.add("hidden");
            postsContainer.classList.add("hidden");
            warning.classList.remove("hidden");
        }
    }
}

// Panggil saat status online/offline berubah dan saat halaman dimuat
window.addEventListener("online", () => {
    togglePost();
    fetchPosts(); // refresh tampilan komentar sesuai status
});
window.addEventListener("offline", () => {
    togglePost();
    fetchPosts(); // refresh tampilan komentar sesuai status
});
document.addEventListener("DOMContentLoaded", togglePost);

var request = new Request('camera_feed.html', {
    method: 'get',
    headers: new Headers({
        'Content-Type': 'text/plain',
    })
});
// Get camera feed
fetch('camera_feed.html', {
    method: 'get',
    headers: new Headers({
        'Content-Type': 'text/plain',
    })
})
    .then((res) => {
        return res.text();
    }).then((html) => {
        let cameraFeedElement = document.getElementById('camera_feed');
        if (cameraFeedElement) {
            cameraFeedElement.innerHTML = html
        }
    }).catch((reason) => {

    });