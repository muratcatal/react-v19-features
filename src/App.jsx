import {
  useState,
  useTransition,
  useActionState,
  useOptimistic,
  use,
  Suspense,
  useRef,
  useEffect,
} from 'react';
import { useFormStatus } from 'react-dom';
import './App.css';

let list = [];

const fetchListService = function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(list);
    }, 2000);
  });
};

const addToListService = function (values, resolveReq = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (resolveReq) {
        list.push(values);

        resolve('success');
      } else {
        reject('rejected!');
      }
    }, 2000);
  });
};

export default function App() {
  const [values, setValues] = useState({
    name: 'a',
    surname: 'b',
  });

  // #6
  const clearButtonRef = useRef();

  const fetchListPromise = fetchListService();

  // #6
  useEffect(() => {
    clearButtonRef.current.disabled = true;
  }, []);

  // #4
  // useOptimistic(state, updateFunction(state,newValue))
  const [optimisticFormValues, setOptimisticFormValues] = useOptimistic(
    values,
    (state, newState) => {
      return {
        ...state,
        name: newState.name + ' is updating',
        surname: newState.surname + ' is updating',
      };
    }
  );

  // #1
  // const [error, setError] = useState();
  // const [isPending, startTransition] = useTransition();

  // #2
  const [result, submitAction, isPending] = useActionState(
    async function (previousState, formData) {
      const input = {
        ...values,
        name: formData.get('name'),
        surname: formData.get('surname'),
      };
      console.log({
        previousState,
        input,
      });
      setOptimisticFormValues(input);
      await addToListService(input);
      return null;
    },
    // previous state
    values
  );

  const handleInputChange = (name, value) => {
    setValues((values) => {
      return {
        ...values,
        [name]: value,
      };
    });
  };

  return (
    <>
      <form
        // #2
        action={submitAction}

        // #1
        // onSubmit={(event) => {
        // event.preventDefault();
        // startTransition(async () => {
        //   const result = await addToListService(values);
        //   console.log({ result });
        // });
        // }}
      >
        <h2>Form</h2>
        <input
          name="name"
          placeholder="Name"
          onChange={(event) =>
            handleInputChange(event.target.name, event.target.value)
          }
          value={values.name}
        />
        <input
          name="surname"
          placeholder="Surname"
          onChange={(event) =>
            handleInputChange(event.target.name, event.target.value)
          }
          value={values.surname}
        />
        <button type="submit">Save</button>
        <ClearButton ref={clearButtonRef} />
        <OptimisticMessages formValues={optimisticFormValues} />
        <FormState />
      </form>
      <Suspense fallback={<div>Fetching list</div>}>
        <List fetchListPromise={fetchListPromise} />
      </Suspense>
    </>
  );
}

const List = ({ fetchListPromise }) => {
  // #5
  const list = use(fetchListPromise);

  return (
    <div>
      <h2>Items</h2>
      {list?.map((item) => (
        <div key={item.name}>
          <div>Name: {item?.name}</div>
          <div>Surname: {item?.surname}</div>
          <hr />
        </div>
      ))}
    </div>
  );
};

const OptimisticMessages = ({ formValues }) => {
  // #4
  return (
    <div>
      <div>Name: {formValues?.name}</div>
      <div>Surname: {formValues?.surname}</div>
    </div>
  );
};

const FormState = () => {
  // #3
  const { pending, action, data, method } = useFormStatus();

  return (
    <>
      <meta title={pending ? 'Pending' : 'Loaded'} />
      <code>
        {JSON.stringify({
          pending,
          data: {
            name: data?.get('name'),
            surname: data?.get('surname'),
            method,
            action,
          },
        })}
      </code>
    </>
  );
};

const ClearButton = ({ ref }) => {
  // #6
  return <button ref={ref}>Clear list</button>;
};
