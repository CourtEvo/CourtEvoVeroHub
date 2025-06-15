import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AthleteDevelopment = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/athlete-development')
            .then(response => setData(response.data))
            .catch(error => console.error(error));
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h2>Introductory Phase (Ages: {data.introductory.ageRange})</h2>
            <ul>
                {data.introductory.skills.map(skill => <li key={skill}>{skill}</li>)}
            </ul>
            <h2>Foundational Phase (Ages: {data.foundational.ageRange})</h2>
            <ul>
                {data.foundational.skills.map(skill => <li key={skill}>{skill}</li>)}
            </ul>
        </div>
    );
};

export default AthleteDevelopment;
