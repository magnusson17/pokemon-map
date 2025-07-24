const cover = document.querySelector(".black-bg-cover")

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
    e.preventDefault()

    if (!cover.classList.contains("active")) {
        cover.classList.add("active")
    }

    const href = this.getAttribute('href')

    setTimeout(() => {
        window.location.href = href
    }, 300)
    })
})

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (cover.classList.contains("active")) {
            cover.classList.remove("active")
        }
    }, 300)
})