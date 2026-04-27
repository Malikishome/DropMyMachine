function ListingCards({ title, description, price, machine_type, location}) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="font-bold text-2xl">{title}</h2>
                <p className="text-gray-600 mt-2">{description}</p>
                <p className="text-gray-600 mt-2">Price: ${price}</p>
                <p className="text-gray-600 mt-2">Machine Type: {machine_type}</p>
                <p className="text-gray-600 mt-2">Location: {location}</p>
            </div>
        </div>
  );
}

export default ListingCards;