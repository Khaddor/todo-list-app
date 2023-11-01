import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  ToastAndroid,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

const Stack = createNativeStackNavigator();

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Load tasks from SecureStore when the component mounts
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await SecureStore.getItemAsync('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await SecureStore.setItemAsync('tasks', JSON.stringify(updatedTasks));
      console.log('Successfully saved tasks');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              tasks={tasks}
              aa={loadTasks}
              setTasks={setTasks}
              saveTasks={saveTasks}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddTodo">
          {(props) => (
            <AddTodoScreen
              {...props}
              tasks={tasks}
              setTasks={setTasks}
              saveTasks={saveTasks}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EditTodoScreen">
          {(props) => (
            <EditTodoScreen
              {...props}
              tasks={tasks}
              saveTasks={saveTasks}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = ({ navigation, tasks, setTasks, saveTasks, route }) => {
  useEffect(() => {
    if (route.params && route.params.updatedTasks) {
      setTasks(route.params.updatedTasks);
    }
  }, [route.params, setTasks]);

  const renderItem = ({ item, index }) => (
    <View style={styles.task}>
      <Text style={styles.itemList}>{item}</Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate('EditTodoScreen', {
            index,
            tasks,
            setTasks,
          })
        }>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(index, tasks, setTasks, saveTasks)}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const deleteTask = (index, tasks, setTasks, saveTasks) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteAllTasks = (tasks) => {
    const updatedTasks = [...tasks];
    if (updatedTasks.length !== 0) {
      updatedTasks.splice(0, updatedTasks.length);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } else {
      console.error('No tasks found');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>To-Do List App</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTodo')}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      <Text style={styles.pendings}>Pending: {tasks.length}</Text>
      <FlatList
        style={styles.tasksborder}
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />

      <TouchableOpacity
        style={styles.deleteallbutton}
        onPress={() => deleteAllTasks(tasks)}>
        <Text style={styles.deleteallTextbutton}>Delete Tasks</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddTodoScreen = ({ navigation, tasks, setTasks, saveTasks }) => {
  const [task, setTask] = useState('');

  const handleAddTask = () => {
    if (task){
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      navigation.navigate('Home');
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      handleAddTask(); // Call your add task function when Enter is pressed
      Keyboard.dismiss(); // Close the keyboard
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add a New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={(text) => setTask(text)}
        onKeyPress={handleKeyPress}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButtonback}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const EditTodoScreen = ({ navigation, route, saveTasks }) => {
  const { index, tasks } = route.params;
  const [task, setTask] = useState(tasks[index]);

  const handleEditTask = () => {
    if (task) {
      const updatedTasks = [...tasks];
      updatedTasks[index] = task;
      console.log('Updated task:', task);
      saveTasks(updatedTasks);
      setTask(updatedTasks[index]);
      navigation.navigate('Home', { updatedTasks });
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      handleEditTask(); // Call your add task function when Enter is pressed
      Keyboard.dismiss(); // Close the keyboard
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Edit task"
        value={task}
        onChangeText={(text) => setTask(text)}
        onKeyPress={handleKeyPress}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleEditTask}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButtonback}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3498db',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  addButtonback: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  editButton: {
    backgroundColor: '#f1c40f',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteallbutton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 10,
  },
  deleteallTextbutton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    fontSize: 20,
    backgroundColor: '#dcdde1',
    padding: 15,
    borderRadius: 10,
  },
  itemList: {
    fontSize: 21,
  },
  pendings: {
    marginTop: 25,
    fontSize: 28,
    color: '#3498db',
    textAlign: 'center',
  },
});

