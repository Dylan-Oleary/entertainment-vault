exports.formatGenres = (genres) => {
    const formattedGenres = [];

    for(let i = 0; i < genres.length; i++){
        i !== genres.length - 1 ? formattedGenres.push(`${genres[i].name}, `) : formattedGenres.push(genres[i].name)
    }
    
    return formattedGenres;
}